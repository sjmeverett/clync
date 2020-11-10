import { Cache, RequestOptions } from './Client';

export class SimpleCache implements Cache {
  private cache = new Map<string, any>();

  constructor(private readonly size: number) {}

  read(request: RequestOptions) {
    return this.cache.get(this.getKey(request));
  }

  write(request: RequestOptions, value: any): void {
    this.cache.set(this.getKey(request), value);

    if (this.cache.size > this.size) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  private getKey(request: RequestOptions) {
    return JSON.stringify(request);
  }
}
