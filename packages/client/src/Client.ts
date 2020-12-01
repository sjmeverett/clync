import { convertOrThrow, FieldDescriptor } from '@sjmeverett/clync-convert';

export interface RequestOptions<TParams, TResult> {
  action: string;
  paramsType: FieldDescriptor;
  resultType: FieldDescriptor;
  params: TParams;
  idempotent?: boolean;
}

export interface Cache {
  read<TParams, TResult>(
    request: RequestOptions<TParams, TResult>,
  ): CacheResult<TResult> | undefined;

  write<TParams, TResult>(
    request: RequestOptions<TParams, TResult>,
    value: TResult,
  ): void;
}

export interface CacheResult<T> {
  result: T;
  stale?: boolean;
}

export interface ClientFetch {
  <TParams, TResult>(request: RequestOptions<TParams, TResult>): Promise<
    TResult
  >;
}

export interface SubscribeCallback<TResult> {
  (data: TResult, loading?: boolean): void;
}

export interface ClientSubscriber {
  request: RequestOptions<any, any>;
  callback: SubscribeCallback<any>;
}

export class Client {
  public readonly subscribers = new Set<ClientSubscriber>();

  constructor(
    private readonly _request: ClientFetch,
    private readonly cache?: Cache,
  ) {}

  async request<TParams, TResult>(
    request: RequestOptions<TParams, TResult>,
  ): Promise<TResult> {
    const params = convertOrThrow('format', request.paramsType, request.params);

    const result = await this._request({ ...request, params });

    return convertOrThrow('parse', request.resultType, result);
  }

  subscribe<TParams, TResult>(
    request: RequestOptions<TParams, TResult>,
    callback: SubscribeCallback<TResult>,
  ): () => void {
    if (!request.idempotent) {
      throw new Error(`${request.action} is not idempotent, cannot subscribe`);
    }

    const subscriber = { request, callback };
    this.subscribers.add(subscriber);
    this.refresh(request.action);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  async refresh(action?: string) {
    const subscribers = Array.from(this.subscribers);

    const filteredSubscribers = action
      ? subscribers.filter((x) => x.request.action === action)
      : subscribers;

    for (const subscriber of filteredSubscribers) {
      await this.runSubscriber(subscriber);
    }
  }

  private async runSubscriber(subscriber: ClientSubscriber) {
    try {
      const cached = subscriber.request.idempotent
        ? this.cache?.read(subscriber.request)
        : undefined;

      const stale = cached?.stale !== false;
      subscriber.callback(cached?.result, stale);

      if (stale) {
        const result = await this.request(subscriber.request);

        if (subscriber.request.idempotent) {
          this.cache?.write(subscriber.request, result);
        }

        subscriber.callback(result, false);
      }
    } catch (e) {
      subscriber.callback(undefined, false);
      throw e;
    }
  }
}
