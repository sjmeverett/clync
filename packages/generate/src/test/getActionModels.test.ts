import { defineAction, defineModel } from '@sjmeverett/clync-define';
import { getActionModels } from '../getActionModels';

const widget = defineModel('Widget', {
  _id: { type: 'string' },
  name: { type: 'string' },
});

const params = defineModel('UpdateWidgetParams', {
  update: { type: widget },
});

const result = defineModel('UpdateWidgetResult', {
  data: { type: widget },
});

const action = defineAction({
  name: 'UpdateWidget',
  params,
  result,
  handler: null as any,
});

test('gets the relevant models', () => {
  const models = getActionModels(action);

  expect(models.size).toEqual(3);
  expect(models.has(widget)).toBeTruthy();
  expect(models.has(params)).toBeTruthy();
  expect(models.has(result)).toBeTruthy();
});
