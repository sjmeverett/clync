type Fn = (...args: any[]) => any;

export interface DataFn<T extends Fn, Context = any> {
  kind: 'DataFn';
  invoke: T;
  bind: (ctx: Context) => T;
}

export interface DefineDataFnSpec<T extends Fn, Context = any> {
  invoke: T;
  bind?: (ctx: Context, fn: T) => T;
}

export function defineDataFn<T extends Fn, Context = any>({
  invoke,
  bind,
}: DefineDataFnSpec<T, Context>): DataFn<T> {
  return {
    kind: 'DataFn',
    invoke: invoke,
    bind: bind ? (ctx) => bind(ctx, invoke) : () => invoke,
  };
}

export function isDataFn(obj: any): obj is DataFn<any> {
  return obj?.kind === 'DataFn';
}

export type DataFnLibrary<T = any> = {
  [K in keyof T]: T[K] extends DataFn<any> ? T[K] : never;
};

export type DataFnType<T> = T extends DataFn<infer R> ? R : T;
