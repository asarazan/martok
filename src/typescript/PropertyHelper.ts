import {
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
export namespace PropertyHelper {
  export function createProperty(
    value: TypeElement
  ): TypescriptProperty | undefined {
    const name = getPropertyName(value);
    const type = getPropertyType(value);
    const optional = isPropertyOptional(value);
    if (!name || !type) return undefined;
    return {
      name,
      type,
      optional,
    };
  }
  export function getPropertyName(value: TypeElement): __String | undefined {
    return (value.name as Identifier).escapedText;
  }
  export function getPropertyType(value: TypeElement): string | undefined {
    return (value as PropertySignature)?.type?.getText();
  }
  export function isPropertyOptional(value: TypeElement): boolean {
    return !!value.questionToken;
  }
}
