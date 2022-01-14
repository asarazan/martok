import { Martok } from "../Martok";
import { MemberBasedGenerator } from "./MemberBasedGenerator";
import {
  isIntersectionTypeNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  TypeAliasDeclaration,
  TypeNode,
  UnionTypeNode,
} from "typescript";
import { all } from "../../typescript/utils";
import { getMembers, getMemberType } from "../../typescript/MemberHelpers";
import { TaggedUnionError } from "../../errors/TaggedUnionError";

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
    const members = getMembers(node, this.checker);
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
        const members = getMembers(type, this.checker);
        return this.members.generate(name, members, { optional: isUnion });
      }
    }
    return undefined;
  }
}
