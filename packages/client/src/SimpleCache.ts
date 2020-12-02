import { Cache, CacheResult, RequestOptions } from './Client';

interface CacheEntry {
  value: any;
  timestamp: number;
}

export class SimpleCache implements Cache {
  private cache = new Map<string, CacheEntry>();

  constructor(private readonly size: number, private ttl?: number) {}

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
    if (request.idempotent) {
      this.cache.set(this.getKey(request), { value, timestamp: Date.now() });

      if (this.cache.size > this.size) {
        this.cache.delete(this.cache.keys().next().value);
      }
    }

    return value;
  }

  subscribe(): () => void {
    return () => {};
  }

  private getKey(request: RequestOptions<any, any>) {
    return JSON.stringify(request);
  }
}
