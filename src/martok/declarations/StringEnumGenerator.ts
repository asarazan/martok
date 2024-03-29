import { Martok } from "../Martok";
import { EnumDeclaration, isEnumDeclaration, UnionTypeNode } from "typescript";
import { getEnumName, getEnumValue } from "../../typescript/EnumHelpers";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import EnumValue = kotlin.EnumValue;

export class StringEnumGenerator {
  private readonly checker;

  public constructor(private readonly martok: Martok) {
    this.checker = this.martok.program.getTypeChecker();
  }

  public generate(name: string, node: UnionTypeNode | EnumDeclaration): Klass {
    return new Klass(name)
      .addGeneratorTypes("string-enum")
      .addAnnotation("@Serializable")
      .addModifier("enum")
      .addCtorArgs({
        name: "serialName",
        type: "String",
        mutability: "val",
      })
      .addEnumValues(...this.getEnumValues(node));
  }

  private getEnumValues(node: UnionTypeNode | EnumDeclaration): EnumValue[] {
    const members = isEnumDeclaration(node) ? node.members : node.types;
    return members.map((value) => {
      const name = getEnumName(this.checker, value);
      const val = getEnumValue(this.checker, value);
      return {
        annotation: `@SerialName("${val}")`,
        name,
        args: [
          {
            name: `"${val}"`,
          },
        ],
      };
    });
  }
}
