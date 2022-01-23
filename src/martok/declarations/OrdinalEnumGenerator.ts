import { Martok } from "../Martok";
import { EnumDeclaration, isEnumDeclaration, UnionTypeNode } from "typescript";
import _ from "lodash";
import indentString from "indent-string";
import { getEnumName, getEnumValue } from "../../typescript/EnumHelpers";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import EnumValue = kotlin.EnumValue;

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

  public generateKlass(
    name: string,
    node: UnionTypeNode | EnumDeclaration
  ): Klass {
    return new Klass("", name)
      .setAnnotation(`@Serializable(with = ${name}.Companion::class)`)
      .addModifier("enum")
      .addCtorArgs({
        name: "value",
        type: "Int",
        mutability: "val",
      })
      .addEnumValues(...this.getEnumValues(node))
      .addInternalClasses(this.getSerializerKlass(name, "TODO"));
  }

  private getEnumDeclarations(
    node: UnionTypeNode | EnumDeclaration,
    suffixes = false
  ): string[] {
    const members = isEnumDeclaration(node) ? node.members : node.types;
    let lastValue: string | undefined;
    return members.map((value, index) => {
      const name = getEnumName(this.checker, value);
      const val = getEnumValue(this.checker, value, lastValue);
      lastValue = val;
      let suffix = "";
      if (suffixes) {
        suffix = index >= members.length - 1 ? ";" : ",";
      }
      return `${name}(${val})${suffix}`;
    });
  }
  private getEnumValues(node: UnionTypeNode | EnumDeclaration): EnumValue[] {
    const members = isEnumDeclaration(node) ? node.members : node.types;
    let lastValue: string | undefined;
    return members.map((value) => {
      const name = getEnumName(this.checker, value);
      const val = getEnumValue(this.checker, value, lastValue);
      lastValue = val;
      return {
        name,
        args: [
          {
            name: val,
          },
        ],
      };
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

  private getSerializerKlass(className: string, serialName: string): Klass {
    return new Klass()
      .addModifier("companion")
      .setKlassType("object")
      .setExtends({
        name: `KSerializer<${className}>`,
      })
      .addMembers({
        visibility: "override",
        name: "descriptor",
        type: "SerialDescriptor",
        value: `PrimitiveSerialDescriptor("${serialName}", PrimitiveKind.INT)`,
      });
  }
}
