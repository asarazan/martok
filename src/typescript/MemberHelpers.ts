import {
  Declaration,
  factory,
  InternalSymbolName,
  isArrayTypeNode,
  isInterfaceDeclaration,
  isIntersectionTypeNode,
  isLiteralTypeNode,
  isNumericLiteral,
  isParenthesizedTypeNode,
  isPropertySignature,
  isStringLiteralLike,
  isTypeAliasDeclaration,
  isTypeElement,
  isTypeLiteralNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  SyntaxKind,
  TypeChecker,
  TypeElement,
  TypeNode,
} from "typescript";
import { dedupeUnion, TaggedUnionBehavior } from "./UnionHelpers";

const QUESTION_TOKEN = factory.createToken(SyntaxKind.QuestionToken);

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

/**
 * @throws TaggedUnionError
 * @param node
 * @param checker
 * @param taggedUnionBehavior
 */
export function getMembers(
  node: Declaration | TypeNode,
  checker: TypeChecker,
  taggedUnionBehavior: TaggedUnionBehavior = "throw"
): ReadonlyArray<TypeElement> {
  if (isInterfaceDeclaration(node)) {
    const ttype = checker.getTypeAtLocation(node);
    return ttype
      .getProperties()
      .map((value) => value.valueDeclaration)
      .filter((value) => value && isPropertySignature(value)) as TypeElement[];
  } else if (isTypeAliasDeclaration(node) || isParenthesizedTypeNode(node)) {
    return getMembers(node.type, checker, taggedUnionBehavior);
  } else if (isTypeLiteralNode(node)) {
    return node.members;
  } else if (isIntersectionTypeNode(node)) {
    return node.types.flatMap((value) =>
      getMembers(value, checker, taggedUnionBehavior)
    );
  } else if (isUnionTypeNode(node)) {
    return dedupeUnion(
      checker,
      node.types
        .flatMap((value) => getMembers(value, checker, taggedUnionBehavior))
        .map((value) => {
          return {
            ...value,
            // Union type is just where everything is optional lmao
            questionToken: QUESTION_TOKEN,
          };
        }),
      taggedUnionBehavior
    );
  } else if (isTypeReferenceNode(node)) {
    const ref = checker.getTypeAtLocation(node);
    const symbol = ref.aliasSymbol ?? ref.getSymbol();
    const decl = symbol!.declarations![0];
    return getMembers(decl, checker, taggedUnionBehavior);
  }
  return [];
}
