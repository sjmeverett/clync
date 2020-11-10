import { ApiFn, ApiFnParams, ApiFnResult } from './useApi';
import { useFetchState } from './useFetchState';

export function useFetchValue<T extends ApiFn>(
  action: T,
  params?: ApiFnParams<T> | null,
): ApiFnResult<T> | undefined {
  const [value] = useFetchState(action, params);
  return value;
}
