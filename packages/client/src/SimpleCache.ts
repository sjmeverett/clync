import { Cache, RequestOptions } from './Client';

export class SimpleCache implements Cache {
  private cache = new Map<string, any>();

  constructor(private readonly size: number) {}

  read<TParams, TResult>(request: RequestOptions<TParams, TResult>): TResult {
    return this.cache.get(this.getKey(request));
  }

  write<TParams, TResult>(
    request: RequestOptions<TParams, TResult>,
    value: TResult,
  ): void {
    this.cache.set(this.getKey(request), value);

    if (this.cache.size > this.size) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  private getKey(request: RequestOptions<any, any>) {
    return JSON.stringify(request);
  }
}
