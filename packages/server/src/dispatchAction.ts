import { Action } from '@clync/define';
import { convertOrThrow } from '@clync/convert';
import { ActionContext } from './bindDataFns';

export async function dispatchAction<TData>(
  action: Action<ActionContext<TData>>,
  context: ActionContext<TData>,
  params: any,
): Promise<any> {
  const parsed = convertOrThrow('parse', action.params, params);
  const result = await action.handler(context, parsed);
  return convertOrThrow('format', action.result, result);
}
