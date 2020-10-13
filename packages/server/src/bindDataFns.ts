import { DataFnType, isDataFn } from '@clync/define';

export type ActionContext<T, P extends keyof T = keyof T> = {
  [K in P]: DataFnType<T[K]>;
};

export function bindDataFns<T, Context>(context: Context, fns: T) {
  const result: ActionContext<T> = {} as any;

  for (const k in fns) {
    const fn = fns[k];
    result[k] = isDataFn(fn) ? fn.bind(context) : fn;
  }

  return result;
}
