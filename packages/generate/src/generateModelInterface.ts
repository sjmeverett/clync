import {
  isCustomType,
  isModel,
  Model,
  ModelField,
  ModelType,
  isModelType,
  unabbreviateField,
} from '@sjmeverett/clync-define';

export function generateModelInterface(
  model: Model,
  site: 'client' | 'server',
  imports = new Set<string>(),
): [string, Set<string>] {
  let result = `export interface ${model.name} {`;

  for (const key in model.schema) {
    const field = (model.schema as any)[key] as ModelField;
    const type = getFieldType(field, imports, site, true);

    result += `\n  ${key}${field.required ? '' : '?'}: ${type};`;
  }

  result += '\n}\n';

  return [result, imports];
}

export function getFieldType(
  field: ModelField,
  imports: Set<string>,
  site: 'client' | 'server',
  skipUndefined = false,
): string {
  if (field.array) {
    let type = getTypeNameWithModifiers(
      unabbreviateField(field.type),
      imports,
      site,
      false,
    );

    if (type.includes('|')) {
      type = `(${type})`;
    }

    return getTypeNameWithModifiers(
      { ...field, type: (type + '[]') as any },
      imports,
      site,
      skipUndefined,
    );
  } else {
    return getTypeNameWithModifiers(field, imports, site, skipUndefined);
  }
}

function getTypeName(
  type: ModelType,
  imports: Set<string>,
  site: 'client' | 'server',
) {
  if (isCustomType(type)) {
    if (
      site === 'client' &&
      type.clientImport !== null &&
      (type.clientImport || type.import)
    ) {
      imports.add(type.clientImport || type.import!);
    } else if (site === 'server' && type.import) {
      imports.add(type.import);
    }

    return (site === 'client' && type.clientType) || type.type;
  } else if (isModel(type)) {
    return type.name;
  } else {
    return type;
  }
}

function getTypeNameWithModifiers(
  type: ModelField,
  imports: Set<string>,
  site: 'client' | 'server',
  skipUndefined = false,
) {
  let result =
    typeof type.type === 'string' || isModelType(type.type)
      ? getTypeName(type.type, imports, site)
      : getFieldType(type.type, imports, site);

  if (type.nullable) {
    result += ' | null';
  }

  if (!skipUndefined && !type.required) {
    result += ' | undefined';
  }

  return result;
}
