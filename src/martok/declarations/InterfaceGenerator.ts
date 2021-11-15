import { Martok } from "../Martok";
import {
  InterfaceDeclaration,
  isInterfaceDeclaration,
  isPropertySignature,
  PropertySignature,
  TypeElement,
} from "typescript";
import { MemberBasedGenerator } from "./MemberBasedGenerator";

export class InterfaceGenerator {
  private readonly members = new MemberBasedGenerator(this.martok);
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

  public generate(node: InterfaceDeclaration): string[] {
    const members: (PropertySignature | TypeElement)[] = [...node.members];
    node.heritageClauses
      ?.flatMap((value) => value.types)
      .forEach((value) => {
        const type = this.checker.getTypeAtLocation(value);
        const props = type.getProperties();
        for (const prop of props) {
          const value = prop.valueDeclaration;
          if (value && isPropertySignature(value)) {
            members.push(value);
          }
        }
      });
    return this.members.generate(node.name.escapedText!, members);
  }
}
