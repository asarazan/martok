import { MartokProperty } from "../types/MartokProperty";
import { Program } from "typescript";
import { MartokType } from "../types/MartokType";
import { PrimitiveType } from "../typescript/PrimitiveType";

export class Konverter {
  private readonly checker = this.program.getTypeChecker();
  public constructor(private readonly program: Program) {}

  public formatProperty(prop: MartokProperty): string {
    return `val ${prop.name}: ${this.fromType(prop.type)}${
      prop.optional ? "? = null" : ""
    }`;
  }

  public fromType(type: MartokType): string {
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
