import ts, {
  Declaration,
  factory,
  getJSDocTags,
  InternalSymbolName,
  IntersectionTypeNode,
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
  TypeElement,
  TypeNode,
  UnionTypeNode,
} from "typescript";
import { dedupeUnion } from "./UnionHelpers";
import { Martok } from "../martok/Martok";
import { startCase } from "lodash";
import { kotlin } from "../kotlin/Klass";
import KotlinNumber = kotlin.KotlinNumber;

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

type MemberType = {
  type: string;
  nullable: boolean;
};

export function getMemberType(
  martok: Martok,
  type: TypeNode | TypeElement,
  options?: MemberTypeOptions
): MemberType {
  if (isTypeElement(type)) {
    if (!isPropertySignature(type)) throw new Error("Can't find property");
    type = type.type!;
  }

  if (isParenthesizedTypeNode(type)) {
    type = type.type!;
  }

  if (isTypeReferenceNode(type)) {
    if (options?.followReferences === false) {
      const ref = type.typeName.getText();
      if (ref)
        return {
          type: ref,
          nullable: false,
        };
    } else {
      const ttype = martok.checker.getTypeFromTypeNode(type);
      const symbol = ttype.aliasSymbol ?? ttype.symbol;
      if (symbol) {
        martok.pushExternalSymbols(symbol);
      }
    }
  }

  const literal = getLiteralLikeType(martok, type);
  if (literal)
    return {
      type: literal,
      nullable: false,
    };

  if (isUnionTypeNode(type) || isIntersectionTypeNode(type)) {
    if (isUnionNullable(martok, type)) {
      const unionTypes = excludeNullableLiteral(martok, type);
      if (unionTypes.length === 1) {
        const t = getMemberType(martok, unionTypes[0], options);
        return {
          type: t.type,
          nullable: true,
        };
      } else if (unionTypes.length > 1) {
        return {
          type: InternalSymbolName.Type,
          nullable: true,
        };
      } else {
        throw new Error(`Unreachable, union with one type`);
      }
    }
    return {
      type: InternalSymbolName.Type,
      nullable: false,
    };
  }

  const ttype = martok.checker.getTypeFromTypeNode(type);
  const symbol = ttype.aliasSymbol ?? ttype.getSymbol();
  if (!symbol) {
    throw new Error(`Cannot find symbol`);
  }
  return {
    type: symbol.getEscapedName().toString(),
    nullable: false,
  };
}

function isNullableType(type: TypeNode): boolean {
  const isNullableKind = (kind: SyntaxKind) => {
    return (
      kind === SyntaxKind.NullKeyword || kind === SyntaxKind.UndefinedKeyword
    );
  };
  if (isLiteralTypeNode(type)) return isNullableKind(type.literal.kind);
  return isNullableKind(type.kind);
}

/**
 * Checks if union or intersection type contains either `null` or `undefined`.
 * If that's the case, then we may want to make this member nullable.
 */
function isUnionNullable(
  martok: Martok,
  type: UnionTypeNode | IntersectionTypeNode
) {
  return type.types.some(isNullableType);
}

function excludeNullableLiteral(
  martok: Martok,
  type: UnionTypeNode | IntersectionTypeNode
): TypeNode[] {
  return type.types.filter((t) => !isNullableType(t));
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
    const t = getMemberType(martok, type.elementType);
    return `List<${t.type}>`;
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
    return value.tagName.text.toLowerCase() === "precision";
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
