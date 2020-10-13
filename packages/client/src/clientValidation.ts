import { Client, RequestOptions } from './Client';
import { convertOrThrow } from '@clync/convert';

export function clientValidation(client: Client): Client {
  return {
    async request(request: RequestOptions): Promise<any> {
      const params = convertOrThrow(
        'format',
        request.paramsType,
        request.params,
      );

      const result = await client.request({ ...request, params });

      return convertOrThrow('parse', request.resultType, result);
    },
  };
}
