import {
  InternalSymbolName,
  isArrayTypeNode,
  isIntersectionTypeNode,
  isLiteralTypeNode,
  isNumericLiteral,
  isPropertySignature,
  isStringLiteralLike,
  isTypeElement,
  isUnionTypeNode,
  SyntaxKind,
  TypeChecker,
  TypeElement,
  TypeNode,
} from "typescript";

export function getMemberType(
  checker: TypeChecker,
  type: TypeNode | TypeElement
): string {
  if (isTypeElement(type)) {
    if (!isPropertySignature(type)) throw new Error("Can't find property");
    type = type.type!;
  }

  const intrinsic = getIntrinsicType(checker, type);
  if (intrinsic) return intrinsic;

  const literal = getLiteralType(checker, type);
  if (literal) return literal;

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

export function getLiteralType(
  checker: TypeChecker,
  type: TypeNode
): string | undefined {
  if (!isLiteralTypeNode(type)) return undefined;
  switch (type.literal.kind) {
    case SyntaxKind.StringLiteral:
      return "String";
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.FalseKeyword:
      return "Boolean";
    case SyntaxKind.NumericLiteral:
      return "Double";
  }
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
