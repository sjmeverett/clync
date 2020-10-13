import { defineCustomType, defineModel } from '@clync/define';
import dayjs from 'dayjs';
import { convertModel } from '../convertModel';
import { registerTypeConverter } from '../registerTypeConverter';

const keyType = defineCustomType('KeyType', {
  type: 'KeyType',
  clientType: 'string',
});

const dateType = defineCustomType('DateType', {
  type: 'Date',
});

const widget = defineModel('Widget', {
  _id: { type: keyType, required: true },
  name: { type: 'string', required: true },
  dateUpdated: { type: dateType },
  tags: { type: 'string', array: true, required: true },
});

const customArray = defineModel('CustomArray', {
  array: { type: keyType, array: true, required: true },
});

const modelArray = defineModel('ModelArray', {
  array: {
    type: defineModel('Test', { name: { type: 'string' } }),
    array: true,
    required: true,
  },
});

registerTypeConverter('DateType', {
  parse(value: number) {
    return new Date(value);
  },
  format(value: Date) {
    return value.valueOf();
  },
});

registerTypeConverter('KeyType', {
  parse(key: string) {
    return { key };
  },
  format(value: { key: string }) {
    return value.key;
  },
});

test('simple parsing works', () => {
  const [errors, result] = convertModel('parse', widget.schema, {
    _id: '123',
    name: 'test',
    dateUpdated: dayjs('2020-09-26').valueOf(),
    tags: ['abc'],
    extra: true,
  });

  expect(errors).toHaveLength(0);

  expect(result).toEqual({
    _id: { key: '123' },
    name: 'test',
    dateUpdated: dayjs('2020-09-26').toDate(),
    tags: ['abc'],
  });
});

test('custom array parsing works', () => {
  const [errors, result] = convertModel('parse', customArray.schema, {
    array: ['1', '2'],
  });

  expect(errors).toHaveLength(0);

  expect(result).toEqual({
    array: [{ key: '1' }, { key: '2' }],
  });
});

test('model array parsing works', () => {
  const [errors, result] = convertModel('parse', modelArray.schema, {
    array: [{ name: 'abc' }, { name: 'def' }],
  });

  expect(errors).toHaveLength(0);

  expect(result).toEqual({
    array: [{ name: 'abc' }, { name: 'def' }],
  });
});

test('error on missing required field', () => {
  const [errors] = convertModel('parse', modelArray.schema, {});

  expect(errors).toHaveLength(1);

  expect(errors[0]).toEqual({
    path: 'array',
    message: 'Missing required field',
  });
});

test('error on expected array', () => {
  const [errors] = convertModel('parse', modelArray.schema, {
    array: { name: 'abc' },
  });

  expect(errors).toHaveLength(1);

  expect(errors[0]).toEqual({
    path: 'array',
    message: 'Expected array',
  });
});
