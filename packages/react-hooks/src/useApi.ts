import { RequestOptions } from '@sjmeverett/clync-client';
import { useCallback, useState } from 'react';
import { useClient } from './useClient';

export type ApiFn<TParams = any, TResult = any> = (
  params: TParams,
) => RequestOptions<TParams, TResult>;

export type ApiFnParams<T> = T extends ApiFn<infer P> ? P : never;

export type ApiFnResult<T> = T extends ApiFn<any, infer R> ? R : never;

export function useApi<T extends ApiFn>(
  action: T,
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
        return await client.request(action(params));
      } finally {
        setLoading((loading) => loading - 1);
      }
    },
    [client, action],
  );

  return [call, loading > 0];
}
