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

    import { Client } from '@sjmeverett/clync-client';
    export function updateWidget(client: Client, params: UpdateWidgetParams): Promise<UpdateWidgetResult> {
      return client.request({
        action: 'UpdateWidget',
        paramsType: {\\"type\\":{\\"kind\\":\\"Model\\",\\"name\\":\\"UpdateWidgetParams\\"},\\"required\\":true},
        resultType: {\\"type\\":{\\"kind\\":\\"Model\\",\\"name\\":\\"UpdateWidgetResult\\"},\\"required\\":true},
        params
      });
    }

    "
  `);
});
