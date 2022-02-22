import { Martok } from "../Martok";
import {
  isIntersectionTypeNode,
  isLiteralExpression,
  isLiteralTypeNode,
  isParenthesizedTypeNode,
  isPropertySignature,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  PropertySignature,
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
    if (!isTypeAliasDeclaration(node)) return undefined;
    if (!isIntersectionTypeNode(node.type)) return undefined;
    if (!isTypeLiteralNode(node.type.types[0])) return undefined;
    if (!isParenthesizedTypeNode(node.type.types[1])) return undefined;
    if (!isUnionTypeNode(node.type.types[1].type)) return undefined;

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
            { abstract: true, followReferences: true }
          );
        })
      )
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
      const name = prop1.name?.getText();
      if (!name) continue;
      const k = this.getTagValue(prop1);
      // We've found a candidate for our tag discriminator.
      if (!k) continue;
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
          (value) => value.name?.getText() === name
        );
        if (!prop2?.name) continue outer;
        const k2 = this.getTagValue(prop2);
        if (!k2) continue outer;
        result.mappings[k2] = type2;
      }
      return result;
    }
    return undefined;
  }

  private getTagValue(prop: TypeElement): string | undefined {
    if (!isPropertySignature(prop)) return undefined;
    const propType = prop.type;
    if (!propType) return undefined;
    if (isTypeReferenceNode(propType)) {
      const ref = this.checker.getTypeFromTypeNode(propType);
      if (!ref.isStringLiteral()) return undefined;
      return ref.value;
    }
    if (!isLiteralTypeNode(propType)) return undefined;
    if (!isLiteralExpression(propType.literal)) return undefined;
    return propType.literal.text;
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
