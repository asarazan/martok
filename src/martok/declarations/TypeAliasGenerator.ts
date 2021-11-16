import { Martok } from "../Martok";
import { MemberBasedGenerator } from "./MemberBasedGenerator";
import {
  Declaration,
  DeclarationStatement,
  isIntersectionTypeNode,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isUnionTypeNode,
  Node,
  TypeAliasDeclaration,
  TypeElement,
} from "typescript";

export class TypeAliasGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(node: TypeAliasDeclaration): string[] {
    if (isUnionTypeNode(node.type)) {
      return this.martok.declarations.enums.generate(
        node.name.escapedText!,
        node.type
      );
    }
    const members = this.getMembers(node);
    return this.members.generate(node.name.escapedText!, members);
  }

  private getMembers(node: TypeAliasDeclaration): ReadonlyArray<TypeElement> {
    if (isTypeLiteralNode(node.type)) {
      return node.type.members;
    } else if (isIntersectionTypeNode(node.type)) {
      const types = node.type.types;
      const members: TypeElement[] = [];
      for (const type of types) {
        const ttype = this.checker.getTypeAtLocation(type);
        const symbol = ttype.aliasSymbol ?? ttype.getSymbol();
        const decl = symbol!.declarations![0];
        if (isTypeLiteralNode(decl)) {
          // not sure why we need this...
          members.push(...decl.members);
        } else if (isTypeAliasDeclaration(decl)) {
          members.push(...this.getMembers(decl)); // TODO this is probably where union stuff goes.
        }
      }
      return members;
    }
    throw new Error(
      `Unsupported type alias declaration: ${node.name.escapedText}`
    );
  }
}
