import {
  PrimitiveType,
  PropertyType,
  TypescriptProperty,
} from "../typescript/TypescriptProperty";
import { Program } from "typescript";

export class Konverter {
  private readonly checker = this.program.getTypeChecker();
  public constructor(private readonly program: Program) {}

  public formatProperty(prop: TypescriptProperty): string {
    return `val ${prop.name}: ${this.fromType(prop.type)}${
      prop.optional ? "? = null" : ""
    }`;
  }

  public fromType(type: PropertyType): string {
    if (type.file) {
      // this means it's not a primitive.
      return type.name;
    } else {
      switch (type.name as PrimitiveType) {
        case "string":
          return "String";
        case "number":
          return "Double";
        case "boolean":
          return "Boolean";
        case "any":
          return "JsonObject";
        default:
          throw new Error(`Unsupported property type: ${type}`);
      }
    }
  }
}
