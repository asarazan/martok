import { Martok } from "../Martok";
import { UnionTypeNode } from "typescript";
import _ from "lodash";
import indentString from "indent-string";
import { pascalToSnake } from "../NameGenerators";

export class OrdinalEnumGenerator {
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(name: string[], node: UnionTypeNode): string[] {
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

  private getEnumDeclarations(node: UnionTypeNode): string[] {
    return node.types.map((value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      if (!type.isNumberLiteral()) {
        throw new Error("Only string literal unions are supported");
      }
      return `${this.getValName(type.value)}(${type.value})`;
    });
  }

  private getDeserializers(node: UnionTypeNode): string[] {
    return node.types.map((value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      if (!type.isNumberLiteral()) {
        throw new Error("Only string literal unions are supported");
      }
      return `${type.value} -> ${this.getValName(type.value)}`;
    });
  }

  private getValName(value: number): string {
    return `_${value}`;
  }
}
