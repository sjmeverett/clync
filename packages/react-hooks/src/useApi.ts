import { Client } from '@sjmeverett/clync-client';
import { useCallback, useState } from 'react';
import { useClient } from './useClient';

export type ApiFn<Params = any, Result = any> = (
  client: Client,
  params: Params,
) => Promise<Result>;

export type ApiFnParams<T> = T extends ApiFn<infer P> ? P : never;

export type ApiFnResult<T> = T extends ApiFn<any, infer R> ? R : never;

export function useApi<T extends ApiFn>(
  fn: T,
): [(params: ApiFnParams<T>) => Promise<ApiFnResult<T>>, boolean] {
  const client = useClient();
  const [loading, setLoading] = useState(0);

  const call = useCallback(
    async (params: ApiFnParams<T>) => {
      if (!client) {
        throw new Error(`No client in context`);
      }

      setLoading((loading) => loading + 1);

      try {
        return await fn(client, params);
      } finally {
        setLoading((loading) => loading - 1);
      }
    },
    [client, fn],
  );

  return [call, loading > 0];
}
