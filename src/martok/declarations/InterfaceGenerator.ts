import { Martok } from "../Martok";
import { InterfaceDeclaration } from "typescript";
import { MemberBasedGenerator } from "./MemberBasedGenerator";

export class InterfaceGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  public constructor(private readonly martok: Martok) {}

  public generate(node: InterfaceDeclaration): string[] {
    return this.members.generate(node.name.escapedText!, node.members);
  }
}
