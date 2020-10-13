import { CustomType, isCustomType } from './defineCustomType';

export interface Model {
  kind: 'Model';
  name: string;
  schema: ModelSchema;
}

export type AbbreviatedModelField = ModelType | ModelField;

export type AbbreviatedModelSchema = Record<string, AbbreviatedModelField>;

export type ModelSchema = Record<string, ModelField>;

export type ModelType = IntrinsicType | CustomType | Model;

export type ModelField =
  | {
      type: ModelType;
      required?: boolean;
      array?: boolean;
      nullable?: boolean;
    }
  | {
      type: ModelField;
      required?: boolean;
      array: true;
      nullable?: boolean;
    };

export type IntrinsicType = 'string' | 'number' | 'boolean' | 'void';

export function defineModel(
  name: string,
  schema: AbbreviatedModelSchema,
): Model {
  if (!name.match(/^[a-z][a-z0-9]*$/i)) {
    throw new Error(`Invalid model name ${name}`);
  } else if (models[name]) {
    throw new Error(`Model ${name} already defined`);
  }

  const model = {
    kind: 'Model' as const,
    name,
    schema: makeUnabbreviatedSchema(schema),
  };

  models[name] = model;
  return model;
}

export function isModel(value: any): value is Model {
  return value?.kind === 'Model';
}

export const models: Record<string, Model> = {};

type SpecificModelSchema<T extends Record<string, any>> = {
  [K in keyof T]: ModelField;
};

export function makeUnabbreviatedSchema<T extends AbbreviatedModelSchema>(
  schema: T,
) {
  const result: SpecificModelSchema<T> = {} as any;

  for (const k in schema) {
    result[k] = unabbreviateField(schema[k]);
  }

  return result;
}

export function unabbreviateField(field: AbbreviatedModelField): ModelField {
  if (isModelType(field)) {
    return { type: field, required: true };
  } else {
    return field;
  }
}

export function isModelType(obj: any): obj is ModelType {
  return isIntrinsicType(obj) || isCustomType(obj) || isModel(obj);
}

export function isIntrinsicType(obj: any): obj is IntrinsicType {
  return (
    typeof obj === 'string' &&
    (obj === 'string' ||
      obj === 'number' ||
      obj === 'boolean' ||
      obj === 'void')
  );
}
