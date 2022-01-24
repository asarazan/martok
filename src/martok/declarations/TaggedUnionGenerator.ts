import { Martok } from "../Martok";
import {
  isIntersectionTypeNode,
  isLiteralExpression,
  isLiteralTypeNode,
  isParenthesizedTypeNode,
  isPropertySignature,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isUnionTypeNode,
  TypeElement,
  TypeNode,
  UnionTypeNode,
} from "typescript";
import { getMembers } from "../../typescript/MemberHelpers";
import _ from "lodash";
import indentString from "indent-string";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { SupportedDeclaration } from "./KlassGenerator";

type TagMappings = {
  name: string;
  mappings: Record<string, TypeNode>;
};

export class TaggedUnionGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

  public generateKlass(
    name: string,
    node: SupportedDeclaration | TypeNode
  ): Klass | undefined {
    if (
      !(
        isTypeAliasDeclaration(node) &&
        isIntersectionTypeNode(node.type) &&
        isTypeLiteralNode(node.type.types[0]) &&
        isParenthesizedTypeNode(node.type.types[1]) &&
        isUnionTypeNode(node.type.types[1].type)
      )
    ) {
      return undefined;
    }

    const members = [...getMembers(node, this.checker, true)];
    const union = node.type.types[1].type;
    const tag = this.getTag(union);
    if (!tag) return undefined;
    const result = new Klass(name)
      .setAnnotation(`@Serializable(with = ${name}.UnionSerializer::class)`)
      .addModifier("sealed")
      .addMembers(
        ...members.map((value) => {
          return this.martok.declarations.klasses.generateMemberOrCtorArg(
            value,
            { abstract: true }
          );
        })
      )
      // .addMembers({
      //   name: tag.name,
      //   type: "String",
      //   abstract: true,
      // })
      .addInternalClasses(
        ...this.martok.declarations.klasses.generateInnerKlasses(members)
      );
    result.addInternalClasses(
      ...this.generateSerializerAndFriends(name, tag, result)
    );
    return result;
  }

  private getTag(node: UnionTypeNode): TagMappings | undefined {
    const [type1, ...others] = node.types;
    if (!isTypeLiteralNode(type1)) return undefined;
    outer: for (const prop1 of type1.members) {
      if (!prop1.name) continue;
      if (!isPropertySignature(prop1)) continue;
      const propType = prop1.type;
      if (!propType) continue;
      if (!isLiteralTypeNode(propType)) continue;
      if (!isLiteralExpression(propType.literal)) continue;

      // We've found a candidate for our tag discriminator.
      const name = prop1.name.getText();
      const k = propType.literal.text;
      const result: TagMappings = {
        name,
        mappings: {
          [k]: type1,
        },
      };

      // Now we need to optimistically build the rest of the map.
      for (const type2 of others) {
        if (!isTypeLiteralNode(type2)) continue outer;
        const prop2 = type2.members.find(
          (value) => value.name?.getText() === prop1.name.getText()
        );
        if (!prop2?.name) continue outer;
        if (!isPropertySignature(prop2)) continue outer;
        const propType2 = prop2.type;
        if (!propType2) continue outer;
        if (!isLiteralTypeNode(propType2)) continue outer;
        if (!isLiteralExpression(propType2.literal)) continue outer;
        const k2 = propType2.literal.text;
        result.mappings[k2] = type2;
      }
      return result;
    }
    return undefined;
  }

  private generateSerializerAndFriends(
    name: string,
    tag: TagMappings,
    parent: Klass
  ): Klass[] {
    const result = [];
    let counter = 0;
    const tagMapping = _.map(tag.mappings, (v, k) => {
      const subName = `${name}${++counter}`;
      result.push(
        this.martok.declarations.klasses.generate(v, {
          forceName: subName,
          extendSealed: parent,
        }) as Klass
      );
      return `JsonPrimitive("${k}") -> ${subName}.serializer()`;
    });
    result.push(
      new Klass("UnionSerializer").setKlassType("object").setExtends({
        name: `JsonContentPolymorphicSerializer<${name}>`,
        args: [{ name: `${name}::class` }],
      })
        .addStatements(`override fun selectDeserializer(element: JsonElement) = when(
        val type = element.jsonObject["${tag.name}"]
    ) {
${indentString(tagMapping.join("\n"), 8)}
        else -> throw IllegalArgumentException("Unexpected type: $type")
}`)
    );
    return result;
  }
}
