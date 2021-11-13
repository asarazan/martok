import ts, {
  __String,
  Identifier,
  InterfaceDeclaration,
  isOptionalTypeNode,
  Program,
  PropertySignature,
  TypeChecker,
  TypeElement,
} from "typescript";
import { TypescriptProperty } from "./TypescriptProperty";

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

  private getPropertyType(value: TypeElement): string | undefined {
    return (value as PropertySignature)?.type?.getText();
  }

  private isPropertyOptional(value: TypeElement): boolean {
    return !!value.questionToken;
  }
}
