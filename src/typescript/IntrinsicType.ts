import {
  InternalSymbolName,
  isArrayTypeNode,
  isIntersectionTypeNode,
  isNumericLiteral,
  isStringLiteralLike,
  isUnionTypeNode,
  SyntaxKind,
  TypeChecker,
  TypeNode,
} from "typescript";

export const INTRINSICS: Record<string, string> = {
  string: "String",
  number: "Double",
  boolean: "Boolean",
  Array: "List",
  any: "JsonObject",
};

export function getMemberType(checker: TypeChecker, type: TypeNode): string {
  const intrinsic = getIntrinsicType(checker, type);
  if (intrinsic) return intrinsic;
  if (isUnionTypeNode(type) || isIntersectionTypeNode(type)) {
    return InternalSymbolName.Type;
  }
  const ttype = checker.getTypeFromTypeNode(type);
  const symbol = ttype.aliasSymbol ?? ttype.getSymbol();
  if (!symbol) {
    throw new Error(`Cannot find symbol`);
  }
  return symbol.getEscapedName().toString();
}

export function getIntrinsicType(
  checker: TypeChecker,
  type: TypeNode
): string | undefined {
  if (isStringLiteralLike(type) || type.kind === SyntaxKind.StringKeyword)
    return "String";
  if (isNumericLiteral(type) || type.kind === SyntaxKind.NumberKeyword)
    return "Double";
  if (type.kind === SyntaxKind.BooleanKeyword) return "Boolean";
  if (isArrayTypeNode(type)) {
    const param = getMemberType(checker, type.elementType);
    // TODO should we support JsonArray here or leave it as list of JsonObject?
    return `List<${param}>`;
  }
  if (type.kind === SyntaxKind.AnyKeyword) return "JsonObject";
}
