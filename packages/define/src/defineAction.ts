import {
  ModelField,
  AbbreviatedModelField,
  makeUnabbreviatedSchema,
} from './defineModel';

export interface Action<Context, Params = any, Result = any> {
  kind: 'action';
  name: string;
  mutation?: boolean;
  params: ModelField;
  result: ModelField;
  handler: ActionHandler<Context, Params, Result>;
}

export interface ActionHandler<Context, Params, Result> {
  (ctx: Context, params: Params): Promise<Result>;
}

interface ActionSpec<Library, Params, Result>
  extends Omit<Action<Library, Params, Result>, 'kind' | 'params' | 'result'> {
  params: AbbreviatedModelField;
  result: AbbreviatedModelField;
}

export function defineAction<
  Library,
  Params,
  Result,
  DataFnNames extends keyof Library = keyof Library
>({
  params,
  result,
  ...action
}: ActionSpec<Library, Params, Result>): Action<
  Pick<Library, DataFnNames>,
  Params,
  Result
> {
  if (!action.name.match(/^[a-z][a-z0-9]*$/i)) {
    throw new Error(`Invalid action name ${action.name}`);
  }

  return {
    kind: 'action',
    ...action,
    ...makeUnabbreviatedSchema({ params, result }),
  } as any;
}

export function isAction(obj: any): obj is Action<any, any, any> {
  return obj?.kind === 'action';
}
