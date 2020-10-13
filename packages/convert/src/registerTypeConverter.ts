export interface TypeConverter<Type = any, Format = any> {
  parse(value: Format): Type;
  format(value: Type): Format;
}

export const typeConverters = new Map<string, TypeConverter>();

export function registerTypeConverter<Type, Format>(
  name: string,
  converter: TypeConverter<Type, Format>,
) {
  if (typeConverters.has(name)) {
    throw new Error(`Type converter ${name} has already been registered`);
  }

  typeConverters.set(name, converter);
}

export function getTypeConverter(name: string): TypeConverter {
  const converter = typeConverters.get(name);

  return (
    converter || {
      parse: (value) => value,
      format: (value) => value,
    }
  );
}
