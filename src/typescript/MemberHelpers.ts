import ts, {
  Declaration,
  factory,
  getAllJSDocTags,
  getJSDocReturnType,
  getJSDocTags,
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
  Statement,
  SyntaxKind,
  TypeChecker,
  TypeElement,
  TypeNode,
} from "typescript";
import { dedupeUnion } from "./UnionHelpers";
import { Martok } from "../martok/Martok";
import { KotlinNumber } from "../kotlin/KotlinTypes";
import { startCase } from "lodash";

const QUESTION_TOKEN = factory.createToken(SyntaxKind.QuestionToken);

export type MemberTypeOptions = {
  /**
   * @default true
   */
  followReferences?: boolean;

  /**
   * @default true
   * @see TypeReplacer
   */
  performTypeReplacement?: boolean;
};

export function getMemberType(
  martok: Martok,
  type: TypeNode | TypeElement,
  options?: MemberTypeOptions
): string {
  if (isTypeElement(type)) {
    if (!isPropertySignature(type)) throw new Error("Can't find property");
    type = type.type!;
  }

  if (isTypeReferenceNode(type)) {
    if (options?.followReferences === false) {
      const ref = type.typeName.getText();
      if (ref) return ref;
    } else {
      const ttype = martok.checker.getTypeFromTypeNode(type);
      const symbol = ttype.aliasSymbol ?? ttype.symbol;
      if (symbol) {
        martok.pushExternalSymbols(symbol);
      }
    }
  }

  const literal = getLiteralLikeType(martok, type);
  if (literal) return literal;

  if (isUnionTypeNode(type) || isIntersectionTypeNode(type)) {
    return InternalSymbolName.Type;
  }

  const ttype = martok.checker.getTypeFromTypeNode(type);
  const symbol = ttype.aliasSymbol ?? ttype.getSymbol();
  if (!symbol) {
    throw new Error(`Cannot find symbol`);
  }
  return symbol.getEscapedName().toString();
}

export function getLiteralType(
  martok: Martok,
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

export function getReferencedLiteralType(
  martok: Martok,
  type: TypeNode
): string | undefined {
  if (!isTypeReferenceNode(type)) return undefined;
  const ttype = martok.checker.getTypeFromTypeNode(type);
  if (!ttype) return undefined;
  if (ttype.isStringLiteral()) return "String";
  if (ttype.isNumberLiteral()) return "Double";
  return undefined;
}

export function getLiteralLikeType(
  martok: Martok,
  type: TypeNode
): string | undefined {
  return (
    getIntrinsicType(martok, type) ??
    getLiteralType(martok, type) ??
    getReferencedLiteralType(martok, type)
  );
}

export function getIntrinsicType(
  martok: Martok,
  type: TypeNode
): string | undefined {
  if (isStringLiteralLike(type) || type.kind === SyntaxKind.StringKeyword)
    return "String";
  if (isNumericLiteral(type) || type.kind === SyntaxKind.NumberKeyword) {
    return getNumberType(type);
  }
  if (type.kind === SyntaxKind.BooleanKeyword) return "Boolean";
  if (isArrayTypeNode(type)) {
    const param = getMemberType(martok, type.elementType);
    return `List<${param}>`;
  }
  if (type.kind === SyntaxKind.AnyKeyword) return "JsonObject";
}

function getNumberType(node: TypeNode): KotlinNumber {
  let doc: ts.Node = node.parent;
  if (isArrayTypeNode(doc)) doc = doc.parent;
  const tag = getJSDocPrecision(doc) ?? "double";
  return startCase(tag) as KotlinNumber;
}

function getJSDocPrecision(node: ts.Node): string | undefined {
  return getJSDocTags(node).find((value) => {
    return value.tagName.text === "precision";
  })?.comment as string;
}

/**
 * @throws TaggedUnionError
 * @param node
 * @param checker
 * @param isTaggedUnion
 */
export function getMembers(
  node: Declaration | TypeNode,
  martok: Martok,
  isTaggedUnion = false
): ReadonlyArray<TypeElement> {
  const checker = martok.checker;
  if (isInterfaceDeclaration(node)) {
    const ttype = checker.getTypeAtLocation(node);
    return ttype
      .getProperties()
      .map((value) => value.valueDeclaration)
      .filter((value) => value && isPropertySignature(value)) as TypeElement[];
  } else if (isTypeAliasDeclaration(node) || isParenthesizedTypeNode(node)) {
    return getMembers(node.type, martok, isTaggedUnion);
  } else if (isTypeLiteralNode(node)) {
    return node.members;
  } else if (isIntersectionTypeNode(node)) {
    return node.types.flatMap((value) =>
      getMembers(value, martok, isTaggedUnion)
    );
  } else if (isUnionTypeNode(node)) {
    return dedupeUnion(
      martok,
      node.types
        .flatMap((value) => getMembers(value, martok, isTaggedUnion))
        .map((value) => {
          return isTaggedUnion
            ? value
            : {
                ...value,
                // Union type is just where everything is optional lmao
                questionToken: QUESTION_TOKEN,
              };
        }),
      isTaggedUnion,
      node
    );
  } else if (isTypeReferenceNode(node)) {
    const ref = checker.getTypeAtLocation(node);
    const symbol = ref.aliasSymbol ?? ref.getSymbol();
    if (symbol) {
      const decl = symbol!.declarations![0];
      return getMembers(decl, martok, isTaggedUnion);
    }
  }
  return [];
}
