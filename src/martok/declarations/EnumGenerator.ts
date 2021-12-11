import { Martok } from "../Martok";
import {
  EnumDeclaration,
  isEnumDeclaration,
  isStringLiteral,
  UnionTypeNode,
} from "typescript";
import { StringEnumGenerator } from "./StringEnumGenerator";
import { OrdinalEnumGenerator } from "./OrdinalEnumGenerator";
import { all } from "../../typescript/utils";

export class EnumGenerator {
  private readonly strings = new StringEnumGenerator(this.martok);
  private readonly ordinals = new OrdinalEnumGenerator(this.martok);

  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(
    name: string[],
    node: UnionTypeNode | EnumDeclaration
  ): string[] {
    const generator = this.isStringEnum(node) ? this.strings : this.ordinals;
    return generator.generate(name, node);
  }

  private isStringEnum(node: UnionTypeNode | EnumDeclaration): boolean {
    if (isEnumDeclaration(node)) {
      const types = node.members;
      return all(types, (value) => {
        return value.initializer ? isStringLiteral(value.initializer) : false;
      });
    }
    return all(node.types, (value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      return type.isStringLiteral();
    });
  }
}
