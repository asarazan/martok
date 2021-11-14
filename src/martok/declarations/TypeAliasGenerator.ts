import { Martok } from "../Martok";
import { MemberBasedGenerator } from "./MemberBasedGenerator";
import { TypeAliasDeclaration } from "typescript";

export class TypeAliasGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}
  public generate(node: TypeAliasDeclaration): string[] {
    const type = this.checker.getTypeFromTypeNode(node.type);
    if (type.isUnion()) {
      throw new Error("Unions not yet supported");
    }
    return this.members.generate(
      node.name.escapedText!,
      (node.type as any).members // TODO figure out the right way to do this.
    );
  }
}
