export const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return typeof obj === "object" && obj !== null;
};

type TypeString =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export const hasPropertyOfType = (
  obj: Record<string, unknown>,
  propName: string,
  type: TypeString
): boolean => {
  return propName in obj && typeof obj[propName] === type;
};

export const isArrayOf = <T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] => {
  return Array.isArray(value) && value.every(guard);
};
