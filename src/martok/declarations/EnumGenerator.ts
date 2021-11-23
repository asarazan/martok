import { Martok } from "../Martok";
import { UnionTypeNode } from "typescript";
import _ from "lodash";
import { pascalToSnake } from "../NameGenerators";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const indentString = require("indent-string");

export class EnumGenerator {
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(name: string[], node: UnionTypeNode): string[] {
    const pkg = this.martok.getFilePackage(node.getSourceFile());
    const className = _.last(name);
    const serialName = `${pkg}.${name.join(".")}`;
    return [
      `@Serializable(with = ${className}.Companion::class)
enum class ${className}(val value: String) {
${this.getEnumDeclarations(node)
  .map((value) => indentString(value, 4))
  .join(",\n")};

    companion object : KSerializer<${className}> {
        override val descriptor: SerialDescriptor get() {
            return PrimitiveSerialDescriptor("${serialName}", PrimitiveKind.STRING)
        }
        override fun deserialize(decoder: Decoder): ${className} = when (val value = decoder.decodeString()) {
${this.getDeserializers(node)
  .map((value) => indentString(value, 12))
  .join("\n")}
            else   -> throw IllegalArgumentException("${className} could not parse: $value")
        }
        override fun serialize(encoder: Encoder, value: ${className}) {
            return encoder.encodeString(value.value)
        }
    }
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
      const valName = pascalToSnake(name).toUpperCase();
      return `${valName}("${name}")`;
    });
  }

  private getDeserializers(node: UnionTypeNode): string[] {
    return node.types.map((value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      if (!type.isStringLiteral()) {
        throw new Error("Only string literal unions are supported");
      }
      const name = type.value;
      const valName = pascalToSnake(name).toUpperCase();
      return `"${name}" -> ${valName}`;
    });
  }
}
