import { Martok } from "../Martok";
import { EnumDeclaration, isEnumDeclaration, UnionTypeNode } from "typescript";
import { getEnumName, getEnumValue } from "../../typescript/EnumHelpers";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import EnumValue = kotlin.EnumValue;

export class OrdinalEnumGenerator {
  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public generate(name: string, node: UnionTypeNode | EnumDeclaration): Klass {
    const fqn = this.martok.nameScope.join(`.`);
    return new Klass(name)
      .addGeneratorTypes("ordinal-enum")
      .setAnnotation(`@Serializable(with = ${name}.Companion::class)`)
      .addModifier("enum")
      .addCtorArgs({
        name: "value",
        type: "Int",
        mutability: "val",
      })
      .addEnumValues(...this.getEnumValues(node))
      .addInternalClasses(this.getSerializerKlass(name, fqn, node));
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

  private getSerializerKlass(
    className: string,
    serialName: string,
    node: UnionTypeNode | EnumDeclaration
  ): Klass {
    return new Klass()
      .addGeneratorTypes("ordinal-enum")
      .addModifier("companion")
      .setKlassType("object")
      .addImplements(`KSerializer<${className}>`)
      .addMembers({
        visibility: "override",
        name: "descriptor",
        type: "SerialDescriptor",
        value: `PrimitiveSerialDescriptor("${serialName}", PrimitiveKind.INT)`,
      })
      .addStatements(`override fun deserialize(decoder: Decoder) = when (val value = decoder.decodeInt()) {
${this.getDeserializers(node).join("\n")}
            else   -> throw IllegalArgumentException("${className} could not parse: $value")
        }
        override fun serialize(encoder: Encoder, value: ${className}) {
            return encoder.encodeInt(value.value)
        }`);
  }
}
