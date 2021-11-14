import { Martok } from "../Martok";
import { UnionTypeNode } from "typescript";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const indentString = require("indent-string");

export class EnumGenerator {
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(name: string, node: UnionTypeNode): string[] {
    const pkg = this.martok.getFilePackage(node.getSourceFile());
    return [
      `@Serializable(with = ${name}.Companion::class)
enum class ${name}(val value: String) {
${this.getEnumDeclarations(node)
  .map((value) => indentString(value, 4))
  .join(",\n")}

    companion object : KSerializer<${name}> {
        override val descriptor: SerialDescriptor get() {
            return PrimitiveSerialDescriptor("${pkg}.${name}", PrimitiveKind.STRING)
        }
        override fun deserialize(decoder: Decoder): ${name} = when (val value = decoder.decodeString()) {
${this.getDeserializers(node)
  .map((value) => indentString(value, 12))
  .join("\n")}
            else   -> throw IllegalArgumentException("${name} could not parse: $value")
        }
        override fun serialize(encoder: Encoder, value: ${name}) {
            return encoder.encodeString(value.value)
        }
    }
}`,
    ];
  }

  private getEnumDeclarations(node: UnionTypeNode): string[] {
    return node.types.map((value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      if (!type.isStringLiteral()) {
        throw new Error("Only string literal unions are supported");
      }
      const name = type.value;
      return `${name.toUpperCase()}("${name}")`;
    });
  }

  private getDeserializers(node: UnionTypeNode): string[] {
    return node.types.map((value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      if (!type.isStringLiteral()) {
        throw new Error("Only string literal unions are supported");
      }
      const name = type.value;
      return `"${name}" -> ${name.toUpperCase()}`;
    });
  }
}
