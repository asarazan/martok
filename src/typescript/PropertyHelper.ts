import {
  __String,
  Identifier,
  Program,
  PropertySignature,
  TypeElement,
} from "typescript";
import {
  PrimitiveType,
  PrimitiveTypes,
  PropertyType,
  TypescriptProperty,
} from "./TypescriptProperty";
import _ from "lodash";

// eslint-disable-next-line @typescript-eslint/no-namespace
export class PropertyHelper {
  private readonly checker = this.program.getTypeChecker();

  public constructor(private readonly program: Program) {}

  public propertyFromElement(
    value: TypeElement
  ): TypescriptProperty | undefined {
    const name = this.getPropertyName(value);
    const type = this.getPropertyType(value);
    const optional = this.isPropertyOptional(value);
    if (!name || !type) return undefined;
    return {
      name,
      type,
      optional,
    };
  }

  private getPropertyName(value: TypeElement): __String | undefined {
    return (value.name as Identifier).escapedText;
  }

  private getPropertyType(value: TypeElement): PropertyType | undefined {
    const sig = value as PropertySignature;
    const type = sig.type;
    if (!type) return undefined;
    const name = type.getText();
    const ttype = this.checker.getTypeFromTypeNode(type);
    const files = ttype
      .getSymbol()
      ?.getDeclarations()
      ?.map((value1) => value1.getSourceFile());
    return {
      name,
      file: _.first(files),
    };
  }

  private isPropertyOptional(value: TypeElement): boolean {
    return !!value.questionToken;
  }
}
