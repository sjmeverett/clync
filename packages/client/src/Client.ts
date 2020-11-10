import { convertOrThrow, FieldDescriptor } from '@sjmeverett/clync-convert';

export interface RequestOptions {
  action: string;
  paramsType: FieldDescriptor;
  resultType: FieldDescriptor;
  params: any;
}

export interface Cache {
  read(request: RequestOptions): any;
  write(request: RequestOptions, value: any): void;
}

export interface ClientFetch {
  (request: RequestOptions): Promise<any>;
}

export interface SubscribeCallback {
  (data: any, loading?: boolean): void;
}

export interface ClientSubscriber {
  request: RequestOptions;
  callback: SubscribeCallback;
}

export class Client {
  public readonly subscribers = new Set<ClientSubscriber>();

  constructor(
    private readonly _request: ClientFetch,
    private readonly cache?: Cache,
  ) {}

  async request(request: RequestOptions) {
    const params = convertOrThrow('format', request.paramsType, request.params);

    const result = await this._request({ ...request, params });

    return convertOrThrow('parse', request.resultType, result);
  }

  subscribe(request: RequestOptions, callback: SubscribeCallback): () => void {
    const subscriber = { request, callback };
    this.subscribers.add(subscriber);
    this.runSubscriber(subscriber);

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
      const cached = this.cache?.read(subscriber.request);
      subscriber.callback(cached, true);

      const result = await this.request(subscriber.request);
      this.cache?.write(subscriber.request, result);
      subscriber.callback(result, false);
    } catch (e) {
      subscriber.callback(undefined, false);
      throw e;
    }
  }
}
