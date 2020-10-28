import { Dispatch, SetStateAction, useState } from 'react';
import { ApiFn, ApiFnParams, ApiFnResult, useApi } from './useApi';
import useDeepCompareEffect from 'use-deep-compare-effect';

export function useFetchState<T extends ApiFn>(
  fn: T,
  params?: ApiFnParams<T> | null,
): [
  ApiFnResult<T> | undefined,
  Dispatch<SetStateAction<ApiFnResult<T> | undefined>>,
  boolean,
] {
  const [state, setState] = useState<ApiFnResult<T>>();
  const [fetch, loading] = useApi(fn);

  useDeepCompareEffect(() => {
    if (!params) return;

    fetch(params).then((result) => {
      setState(result);
    });
  }, [params]);

  return [state, setState, loading];
}
