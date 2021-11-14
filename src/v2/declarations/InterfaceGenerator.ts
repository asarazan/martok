import { MartokV2 } from "../MartokV2";
import { InterfaceDeclaration } from "typescript";
import { MemberBasedGenerator } from "./MemberBasedGenerator";

export class InterfaceGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  public constructor(private readonly martok: MartokV2) {}

  public generate(node: InterfaceDeclaration): string[] {
    return this.members.generate(node.name.escapedText!, node.members);
  }
}
