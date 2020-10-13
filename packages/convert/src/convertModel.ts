import { getTypeConverter, TypeConverter } from './registerTypeConverter';
import {
  ModelSchema,
  ModelField,
  ModelType,
  models,
  isCustomType,
} from '@clync/define';

export type TypeDescriptor = TypeReference | ModelType;

export interface TypeReference {
  kind: 'CustomType' | 'Model';
  name: string;
}

export type FieldDescriptor =
  | {
      type: TypeDescriptor;
      required?: boolean;
      nullable?: boolean;
      array?: never;
    }
  | {
      type: TypeDescriptor | FieldDescriptor;
      required?: boolean;
      array: true;
      nullable?: boolean;
    };

export interface FieldError {
  path: string;
  message: string;
}

export function convertModel(
  operation: 'parse' | 'format',
  schema: Record<string, FieldDescriptor> | ModelSchema,
  data: any,
  errors: FieldError[] = [],
  path = '',
): [FieldError[], any] {
  const result = {} as any;

  for (const key in schema) {
    result[key] = convertValue(
      operation,
      schema[key],
      data[key],
      errors,
      path + key,
    );
  }

  return [errors, result];
}

export function convertValue(
  operation: 'parse' | 'format',
  field: FieldDescriptor | ModelField,
  value: any,
  errors: FieldError[] = [],
  key = '',
): any {
  if (value != null) {
    if (field.array) {
      if (!Array.isArray(value)) {
        errors.push({ path: key, message: 'Expected array' });
      } else {
        const element = isTypeDescriptor(field.type)
          ? { type: field.type, required: true }
          : field.type;

        return value.map((value, i) =>
          convertValue(operation, element as any, value, errors, `${key}.${i}`),
        );
      }
    } else {
      const type = isTypeReference(field.type)
        ? followTypeReference(field.type)
        : field.type;

      if (typeof field.type === 'string') {
        return convertPrimitive(key, field.type, value, errors);
      } else if (field.type.kind === 'CustomType') {
        return convertFieldCustomType(
          operation,
          key,
          isCustomType(type) ? getTypeConverter(type.name) : (type as any),
          value,
          errors,
        );
      } else if (field.type.kind === 'Model') {
        const [, result] = convertModel(
          operation,
          (type as any).schema,
          value,
          errors,
          `${key}.`,
        );
        return result;
      }
    }
  } else if (field.required && typeof value === 'undefined') {
    errors.push({ path: key, message: 'Missing required field' });
  } else if (!field.nullable && value === null) {
    errors.push({ path: key, message: 'Null supplied for non-nullable field' });
  }

  return value;
}

export function convertOrThrow(
  operation: 'parse' | 'format',
  field: FieldDescriptor | ModelField,
  value: any,
) {
  const errors: FieldError[] = [];
  const result = convertValue(operation, field, value);

  if (errors.length) {
    throw new ConversionError(errors);
  }

  return result;
}

export class ConversionError extends Error {
  constructor(public errors: FieldError[]) {
    super(
      'Conversion error ' +
        errors.map((err) => `  ${err.path}: ${err.message}`).join('\n'),
    );
  }
}

function convertPrimitive(
  path: string,
  type: string,
  value: any,
  errors: FieldError[],
) {
  if (type === 'string' && typeof value !== 'string') {
    errors.push({ path, message: 'Expected string' });
  } else if (type === 'number' && typeof value !== 'number') {
    errors.push({ path, message: 'Expected number' });
  } else if (type === 'boolean' && typeof value !== 'boolean') {
    errors.push({ path, message: 'Expected boolean' });
  }

  return value;
}

function convertFieldCustomType(
  operation: 'format' | 'parse',
  path: string,
  convert: TypeConverter,
  value: any,
  errors: FieldError[],
) {
  try {
    return convert[operation](value);
  } catch (e) {
    errors.push({ path, message: e.message });
  }

  return value;
}

function isTypeReference(obj: any): obj is TypeReference {
  return obj?.kind && (obj.kind === 'CustomType' || obj.kind === 'Model');
}

function followTypeReference(ref: TypeReference) {
  if (ref.kind === 'Model') {
    const model = models[ref.name];

    if (!model) {
      throw new Error(`Could not find model ${ref.name}`);
    }

    return model;
  } else {
    return getTypeConverter(ref.name);
  }
}

function isTypeDescriptor(obj: any): obj is TypeDescriptor {
  return (
    typeof obj === 'string' ||
    (obj?.kind && (obj.kind === 'CustomType' || obj.kind === 'Model'))
  );
}
