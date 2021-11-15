import { Martok } from "../Martok";
import { MemberBasedGenerator } from "./MemberBasedGenerator";
import { isUnionTypeNode, TypeAliasDeclaration } from "typescript";
import { EnumGenerator } from "./EnumGenerator";

export class TypeAliasGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  private readonly enums = new EnumGenerator(this.martok);

  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(node: TypeAliasDeclaration): string[] {
    if (isUnionTypeNode(node.type)) {
      return this.enums.generate(node.name.escapedText!, node.type);
    }
    return this.members.generate(
      node.name.escapedText!,
      (node.type as any).members // TODO figure out the right way to do this.
    );
  }
}
