import { Martok } from "../Martok";
import { isUnionTypeNode, TypeNode, UnionTypeNode } from "typescript";
import { getMembers } from "../../typescript/MemberHelpers";
import { MemberBasedGenerator } from "./MemberBasedGenerator";
import _ from "lodash";
import indentString from "indent-string";

export class TaggedUnionGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  private readonly members = new MemberBasedGenerator(this.martok);
  public constructor(private readonly martok: Martok) {}

  public static hasTaggedUnion(node: TypeNode): node is UnionTypeNode {
    if (!isUnionTypeNode(node)) return false;
    // TODO
    return true;
  }

  public generate(name: string, node: UnionTypeNode): string[] {
    const members = getMembers(node, this.checker);
    const result = [];
    result.push(`@Serializable(with = ${name}.UnionSerializer)
abstract class ${name}`);
    result.push(`{
${members
  .map((value) =>
    this.members.formatMember(
      this.members.generateMember(value, { abstract: true })
    )
  )
  .join("\n")}

${this.members.generateInnerClasses(name, members)}
}`);
    return result;
  }

  private generateSerializer(
    name: string,
    tag: string,
    tags: Record<string, string>
  ): string {
    const tagMapping = _.map(tags, (v, k) => {
      return `JsonPrimitive("${k}") -> ${v}.serializer()`;
    });
    return `object UnionSerializer : JsonContentPolymorphicSerializer<${name}>(${name}::class) {
    override fun selectDeserializer(element: JsonElement) = when(
        val type = element.jsonObject["${tag}"]
    ) {
${indentString(tagMapping.join("\n"), 8)}
        else -> throw IllegalArgumentException("Unexpected gameType: $type")
    }
}`;
  }
}
