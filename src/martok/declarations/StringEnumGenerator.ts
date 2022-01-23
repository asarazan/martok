import { Martok } from "../Martok";
import { EnumDeclaration, isEnumDeclaration, UnionTypeNode } from "typescript";
import _ from "lodash";
import indentString from "indent-string";
import { getEnumName, getEnumValue } from "../../typescript/EnumHelpers";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { joinArray } from "../../typescript/utils";
import EnumValue = kotlin.EnumValue;

export class StringEnumGenerator {
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(
    name: string[],
    node: UnionTypeNode | EnumDeclaration
  ): string[] {
    const className = _.last(name);
    return [
      `@Serializable
enum class ${className} {
${this.getEnumDeclarations(node)
  .map((value) => indentString(value, 4))
  .join(",\n")}
}
`,
    ];
  }

  public generateKlass(
    name: string,
    node: UnionTypeNode | EnumDeclaration
  ): Klass {
    return new Klass("", name)
      .setAnnotation("@Serializable")
      .addModifier("enum")
      .addEnumValues(...this.getEnumValues(node));
  }

  private getEnumDeclarations(
    node: UnionTypeNode | EnumDeclaration,
    suffixes = false
  ): string[] {
    const members = isEnumDeclaration(node) ? node.members : node.types;
    return members.map((value, index) => {
      const name = getEnumName(this.checker, value);
      const val = getEnumValue(this.checker, value);
      let suffix = "";
      if (suffixes) {
        suffix = index >= members.length - 1 ? ";" : ",";
      }
      return `@SerialName("${val}") ${name}${suffix}`;
    });
  }

  private getEnumValues(node: UnionTypeNode | EnumDeclaration): EnumValue[] {
    const members = isEnumDeclaration(node) ? node.members : node.types;
    return members.map((value, index) => {
      const name = getEnumName(this.checker, value);
      const val = getEnumValue(this.checker, value);
      return {
        annotation: `@SerialName("${val}")`,
        name,
      };
    });
  }
}
