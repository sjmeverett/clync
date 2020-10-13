import { ApiFn, ApiFnParams, ApiFnResult } from './useApi';
import { useFetchState } from './useFetchState';

export function useFetchValue<T extends ApiFn>(
  fn: T,
  params?: ApiFnParams<T> | null,
): ApiFnResult<T> | undefined {
  const [value] = useFetchState(fn, params);
  return value;
}
