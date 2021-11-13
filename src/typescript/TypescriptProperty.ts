import { SourceFile } from "typescript";

export type PrimitiveType = "string" | "number" | "boolean" | "any";
export const PrimitiveTypes: string[] = ["string", "number", "boolean", "any"];

export type PropertyType = {
  name: string;
  file?: SourceFile;
};

export type TypescriptProperty = {
  name: string;
  optional: boolean;
  type: PropertyType;
};
