import { defineCustomType, defineModel } from '@clync/define';
import { generateModelInterfaces } from '../generateModelInterfaces';

const keyType = defineCustomType('KeyType', {
  type: 'KeyType',
  clientType: 'string',
  import: 'import { KeyType } from "db"',
  clientImport: null,
});

const dateType = defineCustomType('DateType', {
  type: 'Date',
});

const widget = defineModel('Widget', {
  _id: { type: keyType, required: true },
  name: { type: 'string', required: true },
  dateUpdated: { type: dateType },
  tags: { type: 'string', array: true, required: true, nullable: true },
});

const widgetCollection = defineModel('WidgetCollection', {
  _id: { type: keyType },
  widgets: { type: widget, array: true },
});

test('client works as expected', () => {
  const result = generateModelInterfaces(
    [widget, widgetCollection],
    'client',
    new Set<string>(),
  );

  expect(result).toMatchInlineSnapshot(`
    "export interface Widget {
      _id: string;
      name: string;
      dateUpdated?: Date;
      tags: string[] | null;
    }
    export interface WidgetCollection {
      _id?: string;
      widgets?: Widget[];
    }
    "
  `);
});

test('server works as expected', () => {
  const imports = new Set<string>();

  const result = generateModelInterfaces(
    [widget, widgetCollection],
    'server',
    imports,
  );

  expect(result).toMatchInlineSnapshot(`
    "export interface Widget {
      _id: KeyType;
      name: string;
      dateUpdated?: Date;
      tags: string[] | null;
    }
    export interface WidgetCollection {
      _id?: KeyType;
      widgets?: Widget[];
    }
    "
  `);

  expect(imports.has('import { KeyType } from "db"')).toBeTruthy();
});
