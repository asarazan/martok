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
    const members: TypeElement[] = [];
    if (!isTypeAliasDeclaration(node)) return undefined;
    const type = node.type;
    if (!(isIntersectionTypeNode(type) || isUnionTypeNode(type)))
      return undefined;
    let type1 = type.types[0];
    let type2 = type.types[1];
    if (isParenthesizedTypeNode(type1)) type1 = type1.type;
    if (isParenthesizedTypeNode(type2)) type2 = type2.type;
    const members1 = getMembers(type1, this.checker, false);
    const members2 = getMembers(type2, this.checker, false);
    // if (!isTypeLiteralNode(type1)) return undefined;
    // if (!isUnionTypeNode(type2)) return undefined;

    members.push(...getMembers(type1, this.checker, true));

    // TODO remove tag if exists at top level.
    const union = [type, type1, type2].find((value) =>
      isUnionTypeNode(value)
    ) as UnionTypeNode;
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
      .addMembers({
        name: tag.name,
        type: "String",
        abstract: true,
      })
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
    const members1 = getMembers(type1, this.checker, false);
    // if (!isTypeLiteralNode(type1)) return undefined;
    outer: for (const prop1 of members1) {
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
        // if (!isTypeLiteralNode(type2)) continue outer;
        const members2 = getMembers(type2, this.checker, false);
        const prop2 = members2.find((value) => value.name?.getText() === name);
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
