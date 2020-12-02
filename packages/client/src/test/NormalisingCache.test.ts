import { NormalisingCache } from '../NormalisingCache';

test('reads the cache', () => {
  const cache = new NormalisingCache(500, ['id'], 500);

  cache.cache.set('{"action":"test"}', {
    value: { test: 123 },
    timestamp: Date.now(),
  });

  const result = cache.read({ action: 'test' } as any);

  expect(result).toEqual({
    result: { test: 123 },
    stale: false,
  });
});

test('reads the cache and returns stale when it is', () => {
  const cache = new NormalisingCache(500, ['id'], 500);

  cache.cache.set('{"action":"test"}', {
    value: { test: 123 },
    timestamp: Date.now() - 505,
  });

  const result = cache.read({ action: 'test' } as any);

  expect(result).toEqual({
    result: { test: 123 },
    stale: true,
  });
});

test('writes to the cache idempotent actions', () => {
  const cache = new NormalisingCache(500, ['id'], 500);
  const request = { action: 'test', idempotent: true, resultType: {} };

  cache.write(request as any, {
    test: 123,
  });

  expect(cache.cache.get(JSON.stringify(request))).toMatchObject({
    value: { test: 123 },
  });
});

test('normalises items with the same type and ID', () => {
  const cache = new NormalisingCache(500, ['id'], 500);

  const request = {
    action: 'test',
    idempotent: true,
    resultType: { type: { kind: 'Model', name: 'Widget' } },
  };

  cache.write(request as any, {
    id: '1',
    test: 123,
  });

  cache.write(request as any, {
    id: '1',
    test: 456,
  });

  expect(cache.cache.size).toBe(2);

  expect(cache.cache.get(JSON.stringify(request))).toMatchObject({
    value: { id: '1', test: 456 },
  });

  expect(cache.cache.get('Widget:1')).toMatchObject({
    value: { id: '1', test: 456 },
  });
});

test('updates arrays and subscribers', () => {
  const cache = new NormalisingCache(500, ['id'], 500);

  const request = {
    action: 'getWidgets',
    idempotent: true,
    resultType: {
      type: { kind: 'Model', name: 'Widget' },
      array: true,
      required: true,
    },
  };

  cache.write(request as any, [
    {
      id: '1',
      test: 123,
    },
    { id: '2', test: 234 },
  ]);

  const callback = jest.fn();
  cache.subscribe(request as any, callback);

  cache.write(
    {
      action: 'getWidget',
      idempotent: true,
      resultType: {
        type: { kind: 'Model', name: 'Widget' },
      },
    } as any,

    { id: '2', test: 456 },
  );

  expect(cache.cache.size).toBe(4);

  expect(cache.cache.get(JSON.stringify(request))).toMatchObject({
    value: [
      {
        id: '1',
        test: 123,
      },
      { id: '2', test: 456 },
    ],
  });

  expect(callback).toBeCalledWith([
    {
      id: '1',
      test: 123,
    },
    { id: '2', test: 456 },
  ]);
});
