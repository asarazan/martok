import { Martok } from "../Martok";
import { UnionTypeNode } from "typescript";
import _ from "lodash";
import indentString from "indent-string";
import { pascalToSnake } from "../NameGenerators";

export class StringEnumGenerator {
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(name: string[], node: UnionTypeNode): string[] {
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

  private getEnumDeclarations(node: UnionTypeNode): string[] {
    return node.types.map((value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      if (!type.isStringLiteral()) {
        throw new Error("Only string literal unions are supported");
      }
      const name = type.value;
      return `@SerialName("${name}") ${this.getValName(name)}`;
    });
  }

  private getDeserializers(node: UnionTypeNode): string[] {
    return node.types.map((value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      if (!type.isStringLiteral()) {
        throw new Error("Only string literal unions are supported");
      }
      const name = type.value;
      return `"${name}" -> ${this.getValName(name)}`;
    });
  }

  private getValName(name: string): string {
    let result = pascalToSnake(name).toUpperCase();
    if (!isNaN(parseFloat(result))) {
      result = `_${result.replace(".", "_")}`;
    }
    return result;
  }
}
