/* eslint-disable @typescript-eslint/ban-types */
import {
  EnumMember,
  isEnumMember,
  isNumericLiteral,
  isStringLiteral,
  Node,
  TypeChecker,
  TypeNode,
  Symbol,
} from "typescript";
import { pascalToSnake } from "../martok/NameGenerators";

export function getEnumName(
  checker: TypeChecker,
  value: TypeNode | EnumMember
): string {
  if (isEnumMember(value)) {
    return getValName(value.name.getText()!);
  } else {
    const type = checker.getTypeFromTypeNode(value);
    if (type.isStringLiteral()) {
      return getValName(type.value);
    }
    if (type.isNumberLiteral()) {
      return getValName(`${type.value}`);
    }
    throw new Error("I don't know what to do with this enum.");
  }
}

export function getEnumValue(
  checker: TypeChecker,
  value: TypeNode | EnumMember,
  lastValue?: string
): string {
  if (isEnumMember(value)) {
    const init = value.initializer as Node;
    if (!init) {
      return lastValue === undefined ? "0" : `${parseInt(lastValue) + 1}`;
    }
    if (isNumericLiteral(init)) {
      return init.text;
    }
    if (isStringLiteral(init)) {
      return init.text;
    }
  } else {
    const type = checker.getTypeFromTypeNode(value);
    if (type.isStringLiteral()) {
      return type.value;
    }
    if (type.isNumberLiteral()) {
      return `${type.value}`;
    }
  }
  throw new Error("I don't know what to do with this enum.");
}

export function getValName(name: string): string {
  let result = pascalToSnake(name).toUpperCase();
  if (!isNaN(parseFloat(result))) {
    result = `_${result.replace(/\./g, "_")}`;
  }
  result = result.replace(/\s/g, "_");
  return result;
}

export function symbolHasParent(
  symbol: unknown
): symbol is Symbol & { parent: Symbol } {
  return (symbol as { parent: Symbol })?.parent !== undefined;
}
