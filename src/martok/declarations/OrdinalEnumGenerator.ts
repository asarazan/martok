import { Martok } from "../Martok";
import { EnumDeclaration, isEnumDeclaration, UnionTypeNode } from "typescript";
import _ from "lodash";
import indentString from "indent-string";
import { getEnumName, getEnumValue } from "../../typescript/EnumHelpers";

export class OrdinalEnumGenerator {
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(
    name: string[],
    node: UnionTypeNode | EnumDeclaration
  ): string[] {
    const className = _.last(name);
    const pkg = this.martok.getFilePackage(node.getSourceFile());
    const serialName = `${pkg}.${name.join(".")}`;
    return [
      `@Serializable(with = ${className}.Companion::class)
enum class ${className}(val value: Int) {
${this.getEnumDeclarations(node)
  .map((value) => indentString(value, 4))
  .join(",\n")};

    companion object : KSerializer<${className}> {
        override val descriptor: SerialDescriptor =
            PrimitiveSerialDescriptor("${serialName}", PrimitiveKind.INT)

        override fun deserialize(decoder: Decoder) = when (val value = decoder.decodeInt()) {
${this.getDeserializers(node)
  .map((value) => indentString(value, 12))
  .join("\n")}
            else   -> throw IllegalArgumentException("${className} could not parse: $value")
        }
        override fun serialize(encoder: Encoder, value: ${className}) {
            return encoder.encodeInt(value.value)
        }
    }
}
`,
    ];
  }

  private getEnumDeclarations(node: UnionTypeNode | EnumDeclaration): string[] {
    const members = isEnumDeclaration(node) ? node.members : node.types;
    let lastValue: string | undefined;
    return members.map((value, index) => {
      const name = getEnumName(this.checker, value);
      const val = getEnumValue(this.checker, value, lastValue);
      lastValue = val;
      return `${name}(${val})`;
    });
  }

  private getDeserializers(node: UnionTypeNode | EnumDeclaration): string[] {
    const members = isEnumDeclaration(node) ? node.members : node.types;
    let lastValue: string | undefined;
    return members.map((value) => {
      const name = getEnumName(this.checker, value);
      const val = getEnumValue(this.checker, value, lastValue);
      lastValue = val;
      return `${val} -> ${name}`;
    });
  }
}
