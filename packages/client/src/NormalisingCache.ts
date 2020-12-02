import { isModel } from '@sjmeverett/clync-define';
import {
  CacheResult,
  RequestOptions,
  SubscribeCallback,
  Cache,
} from './Client';

interface CacheEntry {
  value: any;
  timestamp: number;
  keys?: string[];
}

interface CacheSubscriber {
  cacheKey: string;
  callback: SubscribeCallback<any>;
}

export class NormalisingCache implements Cache {
  private cache = new Map<string, CacheEntry>();
  private subscribers = new Set<CacheSubscriber>();

  constructor(private idKeys: string[], private ttl?: number) {}

  read<TParams, TResult>(
    request: RequestOptions<TParams, TResult>,
  ): CacheResult<TResult> | undefined {
    const entry = this.cache.get(this.getKey(request));

    return (
      entry && {
        result: entry.value,
        stale: !this.ttl || entry.timestamp + this.ttl < Date.now(),
      }
    );
  }

  write<TParams, TResult>(
    request: RequestOptions<TParams, TResult>,
    value: TResult,
  ): TResult {
    const keys: string[] = [];

    // if there is a value, store the normalised parts
    if (value) {
      // we only normalise models
      if (isModel(request.resultType.type)) {
        const modelName = request.resultType.type.name;

        if (request.resultType.array) {
          // normalise all array elements
          if (Array.isArray(value)) {
            value = value.map((value) =>
              this.storeModel(modelName, value, keys),
            ) as any;
          }
        } else {
          // normalise the value
          value = this.storeModel(modelName, value, keys);
        }
      }
    }

    const cacheKey = this.getKey(request);

    // store the whole request result if the request is idempotent
    if (request.idempotent) {
      this.cache.set(cacheKey, { value, keys, timestamp: Date.now() });
    }

    // update subscribers to affected keys
    if (keys.length) {
      const keySet = new Set(keys);

      const toUpdate = Array.from(this.cache.entries()).filter(
        ([key, entry]) =>
          key !== cacheKey && entry.keys?.find((key) => keySet.has(key)),
      );

      const subscribers = Array.from(this.subscribers);

      for (const [key, entry] of toUpdate) {
        const updating = subscribers.filter(
          (subscriber) => subscriber.cacheKey === key,
        );

        updating.map((susbcriber) => susbcriber.callback(entry.value));
      }
    }

    return value;
  }

  subscribe<TParams, TResult>(
    request: RequestOptions<TParams, TResult>,
    callback: SubscribeCallback<TResult>,
  ): () => void {
    const cacheKey = this.getKey(request);
    const subscriber = { callback, cacheKey };

    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private storeModel(modelName: string, value: any, keys: string[]) {
    if (!value) return value;
    const id = this.getId(value);

    if (id) {
      const key = `${modelName}:${id}`;
      const existing = this.cache.get(key);
      keys.push(key);

      if (existing) {
        return Object.assign(existing.value, value);
      } else {
        this.cache.set(key, { value, timestamp: Date.now() });
        return value;
      }
    }

    return value;
  }

  private getId(value: any) {
    for (const key of this.idKeys) {
      if (value[key] != null) {
        return value[key];
      }
    }

    return null;
  }

  private getKey(request: RequestOptions<any, any>) {
    return JSON.stringify(request);
  }
}
