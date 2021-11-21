import { Martok } from "../Martok";
import {
  Declaration,
  HeritageClause,
  InterfaceDeclaration,
  isInterfaceDeclaration,
  isPropertySignature,
  TypeElement,
} from "typescript";
import { MemberBasedGenerator } from "./MemberBasedGenerator";

export class InterfaceGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

  public generate(node: InterfaceDeclaration): string[] {
    const ttype = this.checker.getTypeAtLocation(node);
    const members = ttype
      .getProperties()
      .map((value) => value.valueDeclaration)
      .filter((value) => value && isPropertySignature(value)) as TypeElement[];
    return this.members.generate(node.name.escapedText!, members);
  }
}
