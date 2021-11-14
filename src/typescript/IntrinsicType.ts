export const INTRINSICS: Record<string, string> = {
  string: "String",
  number: "Double",
  boolean: "Boolean",
  Array: "List",
  any: "JsonObject",
};

export type IntrinsicType = "string" | "number" | "boolean" | "Array" | "any";
export const IntrinsicTypes: string[] = [
  "string",
  "number",
  "boolean",
  "Array",
  "any",
];
