import { Martok } from "../Martok";
import { MemberBasedGenerator } from "./MemberBasedGenerator";
import ts, {
  Declaration,
  isIntersectionTypeNode,
  isParenthesizedTypeNode,
  isStringLiteral,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  SyntaxKind,
  TypeAliasDeclaration,
  TypeElement,
  TypeLiteralNode,
  TypeNode,
} from "typescript";
import { all } from "../../typescript/utils";

const QUESTION_TOKEN = ts.factory.createToken(SyntaxKind.QuestionToken);

export class TypeAliasGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(node: TypeAliasDeclaration): string[] {
    const type = node.type!;
    if (isTypeReferenceNode(type)) {
      const ref = this.checker.getTypeAtLocation(node);
      const symbol = ref.aliasSymbol ?? ref.getSymbol();
      return [`typealias ${node.name.escapedText} = ${symbol?.name}`];
    } else if (isUnionTypeNode(type)) {
      if (
        all(type.types, (value) => {
          const type = this.checker.getTypeFromTypeNode(value);
          return type.isStringLiteral();
        })
      ) {
        return this.martok.declarations.enums.generate(
          node.name.escapedText!,
          type
        );
      }
    }
    const members = this.getMembers(node);
    return this.members.generate(node.name.escapedText!, members);
  }

  private getMembers(node: Declaration | TypeNode): ReadonlyArray<TypeElement> {
    if (isTypeAliasDeclaration(node) || isParenthesizedTypeNode(node)) {
      return this.getMembers(node.type);
    } else if (isTypeLiteralNode(node)) {
      return node.members;
    } else if (isIntersectionTypeNode(node)) {
      return node.types.flatMap((value) => this.getMembers(value));
    } else if (isUnionTypeNode(node)) {
      return node.types
        .flatMap((value) => this.getMembers(value))
        .map((value) => {
          return {
            ...value,
            // Union type is just where everything is optional lmao
            questionToken: QUESTION_TOKEN,
          };
        });
    } else if (isTypeReferenceNode(node)) {
      const ref = this.checker.getTypeAtLocation(node);
      const symbol = ref.aliasSymbol ?? ref.getSymbol();
      const decl = symbol!.declarations![0];
      return this.getMembers(decl);
    }
    throw new Error(`Unsupported type alias declaration`);
  }
}
