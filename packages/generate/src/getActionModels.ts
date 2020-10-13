import { Action, isModel, Model } from '@clync/define';

export function getActionModels(
  action: Action<any, any, any>,
  models = new Set<Model>(),
) {
  getModels(action.params, models);
  getModels(action.result, models);

  return models;
}

function getModels(field: any, models: Set<Model>) {
  if (isModel(field.type)) {
    models.add(field.type);

    for (const key in field.type.schema) {
      const schemaField = field.type.schema[key];

      if (isModel(field.type)) {
        getModels(schemaField, models);
      }
    }
  } else if (field?.type) {
    getModels(field.type, models);
  }
}
