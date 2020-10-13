import { FieldDescriptor } from '@sjmeverett/clync-convert';

export interface RequestOptions {
  action: string;
  paramsType: FieldDescriptor;
  resultType: FieldDescriptor;
  params: any;
}

export interface Client {
  request(request: RequestOptions): Promise<any>;
}
