import { generateClient } from '../generateClient';
import { defineAction, defineModel } from '@sjmeverett/clync-define';

const widget = defineModel('Widget', {
  _id: 'string',
  name: 'string',
});

const params = defineModel('UpdateWidgetParams', {
  update: widget,
});

const result = defineModel('UpdateWidgetResult', {
  data: widget,
});

const action = defineAction({
  name: 'UpdateWidget',
  params,
  result,
  handler: null as any,
});

test('works as expected', () => {
  const result = generateClient([action]);

  expect(result).toMatchInlineSnapshot(`
    "

    export interface UpdateWidgetParams {
      update: Widget;
    }
    export interface Widget {
      _id: string;
      name: string;
    }
    export interface UpdateWidgetResult {
      data: Widget;
    }

    import { RequestOptions } from '@sjmeverett/clync-client';
    export function updateWidgetAction(params: UpdateWidgetParams): RequestOptions<UpdateWidgetParams, UpdateWidgetResult> {
      return {
        action: 'UpdateWidget',
        paramsType: {\\"type\\":{\\"kind\\":\\"Model\\",\\"name\\":\\"UpdateWidgetParams\\"},\\"required\\":true},
        resultType: {\\"type\\":{\\"kind\\":\\"Model\\",\\"name\\":\\"UpdateWidgetResult\\"},\\"required\\":true},
        params,
        idempotent: false
      };
    }

    "
  `);
});
