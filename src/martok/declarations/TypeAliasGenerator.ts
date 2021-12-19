import { Martok } from "../Martok";
import { MemberBasedGenerator } from "./MemberBasedGenerator";
import ts, {
  Declaration,
  isIntersectionTypeNode,
  isParenthesizedTypeNode,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  SyntaxKind,
  TypeAliasDeclaration,
  TypeElement,
  TypeNode,
} from "typescript";
import { all } from "../../typescript/utils";
import { dedupeUnion } from "../../typescript/UnionHelpers";
import { getMemberType } from "../../typescript/MemberHelpers";

const QUESTION_TOKEN = ts.factory.createToken(SyntaxKind.QuestionToken);

export class TypeAliasGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(node: TypeAliasDeclaration): string[] {
    const name = node.name.escapedText.toString();
    const result = this.generateFromTypeNode(
      node.name.escapedText.toString(),
      node.type!
    );
    if (result) return result;
    const members = this.getMembers(node);
    if (!members.length) {
      return [`typealias ${name} = ${getMemberType(this.checker, node.type)}`];
    }
    return this.members.generate(node.name.escapedText!, members);
  }

  public generateFromTypeNode(
    name: string,
    type: TypeNode
  ): string[] | undefined {
    if (!name) return undefined;
    if (isTypeReferenceNode(type)) {
      const ref = this.checker.getTypeFromTypeNode(type);
      const symbol = ref.aliasSymbol ?? ref.getSymbol();
      return [`typealias ${name} = ${symbol?.name}`];
    } else {
      const isUnion = isUnionTypeNode(type);
      if (isUnion) {
        const canBeEnum = all(type.types, (value) => {
          const type = this.checker.getTypeFromTypeNode(value);
          return type.isStringLiteral();
        });
        if (canBeEnum) {
          return this.martok.declarations.enums.generate([name], type);
        }
      }
      if (isUnion || isIntersectionTypeNode(type)) {
        const members = this.getMembers(type);
        return this.members.generate(name, members, isUnion);
      }
    }
    return undefined;
  }

  private getMembers(node: Declaration | TypeNode): ReadonlyArray<TypeElement> {
    if (isTypeAliasDeclaration(node) || isParenthesizedTypeNode(node)) {
      return this.getMembers(node.type);
    } else if (isTypeLiteralNode(node)) {
      return node.members;
    } else if (isIntersectionTypeNode(node)) {
      return node.types.flatMap((value) => this.getMembers(value));
    } else if (isUnionTypeNode(node)) {
      return dedupeUnion(
        this.checker,
        node.types
          .flatMap((value) => this.getMembers(value))
          .map((value) => {
            return {
              ...value,
              // Union type is just where everything is optional lmao
              questionToken: QUESTION_TOKEN,
            };
          })
      );
    } else if (isTypeReferenceNode(node)) {
      const ref = this.checker.getTypeAtLocation(node);
      const symbol = ref.aliasSymbol ?? ref.getSymbol();
      const decl = symbol!.declarations![0];
      return this.getMembers(decl);
    }
    return [];
  }
}
