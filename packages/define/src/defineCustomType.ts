export interface CustomType {
  kind: 'CustomType';
  name: string;
  type: string;
  import?: string | null;
  clientType?: string;
  clientImport?: string | null;
}

export function defineCustomType(
  name: string,
  def: Omit<CustomType, 'name' | 'kind'>,
): CustomType {
  return { kind: 'CustomType', name, ...def };
}

export function isCustomType(value: any): value is CustomType {
  return value?.kind === 'CustomType';
}
