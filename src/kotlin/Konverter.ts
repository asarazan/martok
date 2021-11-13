import { TypescriptProperty } from "../typescript/TypescriptProperty";
import { Program } from "typescript";

type SupportedType = "string" | "number" | "boolean";

export class Konverter {
  private readonly checker = this.program.getTypeChecker();
  public constructor(private readonly program: Program) {}

  public formatProperty(prop: TypescriptProperty): string {
    return `val ${prop.name}: ${this.fromType(prop.type)}${
      prop.optional ? "? = null" : ""
    }`;
  }

  public fromType(type: string): string {
    switch (type as SupportedType) {
      case "string":
        return "String";
      case "number":
        return "Double";
      case "boolean":
        return "Boolean";
      default:
        throw new Error(`Unsupported property type: ${type}`);
    }
  }
}
