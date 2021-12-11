import { Martok } from "../Martok";
import { EnumDeclaration, isEnumDeclaration, UnionTypeNode } from "typescript";
import _ from "lodash";
import indentString from "indent-string";
import { getEnumName, getEnumValue } from "../../typescript/EnumHelpers";

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

  private getEnumDeclarations(node: UnionTypeNode | EnumDeclaration): string[] {
    const members = isEnumDeclaration(node) ? node.members : node.types;
    return members.map((value) => {
      const name = getEnumName(this.checker, value);
      const val = getEnumValue(this.checker, value);
      return `@SerialName("${val}") ${name}`;
    });
  }
}
