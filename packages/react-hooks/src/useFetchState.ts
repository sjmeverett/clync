import { Dispatch, SetStateAction, useState } from 'react';
import { ApiFn, ApiFnParams, ApiFnResult } from './useApi';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useClient } from './useClient';

export function useFetchState<T extends ApiFn>(
  action: T,
  params?: ApiFnParams<T> | null,
): [
  ApiFnResult<T> | undefined,
  Dispatch<SetStateAction<ApiFnResult<T> | undefined>>,
  boolean,
] {
  const client = useClient();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(undefined);

  useDeepCompareEffect(() => {
    if (!params || !client) return;

    return client.subscribe(action(params), (result, loading) => {
      if (result !== undefined) {
        setState(result);
      }

      if (loading !== undefined) {
        setLoading(loading);
      }
    });
  }, [params]);

  return [state, setState, loading];
}
