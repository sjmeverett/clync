import {
  Action,
  Model,
  ModelType,
  isModel,
  ModelField,
  isModelType,
  isIntrinsicType,
  isCustomType,
} from '@sjmeverett/clync-define';
import { getActionModels } from './getActionModels';
import {
  generateModelInterfaces,
  generateImports,
} from './generateModelInterfaces';
import { getFieldType } from './generateModelInterface';

export function generateClient(actions: Action<any, any, any>[]) {
  const models = new Set<Model>();
  const imports = new Set<string>();

  let client = `import { RequestOptions } from '@sjmeverett/clync-client';`;

  for (const action of actions) {
    getActionModels(action, models);

    const name = action.name[0].toLowerCase() + action.name.substring(1);

    if (typeof action.params.required === 'undefined') {
      action.params.required = true;
    }

    const paramsType = getFieldType(action.params, imports, 'client');
    const resultType = getFieldType(action.result, imports, 'server');

    client += `
export function ${name}Action(params: ${paramsType}): RequestOptions<${paramsType}, ${resultType}> {
  return {
    action: '${action.name}',
    paramsType: ${getJsonFieldDescriptor(action.params)},
    resultType: ${getJsonFieldDescriptor(action.result)},
    params,
    idempotent: ${action.idempotent ? 'true' : 'false'}
  };
}
`;
  }

  const interfaces = generateModelInterfaces(
    Array.from(models),
    'client',
    imports,
  );

  return `${generateImports(imports)}
${interfaces}
${client}
`;
}

function getTypeDescriptor(type: ModelType) {
  if (isIntrinsicType(type)) {
    return type;
  } else if (isModel(type)) {
    return { kind: 'Model', name: type.name };
  } else if (isCustomType(type)) {
    return { kind: 'CustomType', name: type.name };
  } else {
    throw new Error(`Cannot get type descriptor for ${JSON.stringify(type)}`);
  }
}

function getFieldDescriptor(field: ModelField): any {
  const type = isModelType(field.type)
    ? getTypeDescriptor(field.type)
    : getFieldDescriptor(field.type);

  return {
    type,
    required: field.required,
    array: field.array,
    nullable: field.nullable,
  };
}

function getJsonFieldDescriptor(field: ModelField) {
  return JSON.stringify(getFieldDescriptor(field));
}
