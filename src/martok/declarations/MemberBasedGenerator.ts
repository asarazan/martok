import { Martok } from "../Martok";
import {
  InternalSymbolName,
  isIntersectionTypeNode,
  isPropertySignature,
  isTypeLiteralNode,
  isUnionTypeNode,
  TypeElement,
} from "typescript";
import { getMemberType } from "../../typescript/MemberHelpers";
import indentString from "indent-string";
import { title } from "../NameGenerators";
import _ from "lodash";
import { all } from "../../typescript/utils";

export class MemberBasedGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  private innerClassNameStack: string[] = [];
  public constructor(private readonly martok: Martok) {}

  public generate(
    name: string,
    members: ReadonlyArray<TypeElement>,
    forceOptional = false
  ): string[] {
    const result: string[] = [];
    result.push(`@Serializable
data class ${name}(
${this.generateMembers(members, forceOptional)}
)${this.generateInnerClasses(name, members)}`);
    return result;
  }

  private generateMembers(
    members: ReadonlyArray<TypeElement>,
    forceOptional: boolean
  ): string {
    function formatMember(member: string[]): string {
      return member.map((value) => `  ${value}`).join("\n");
    }
    return `${members
      .map((value) => formatMember(this.generateMember(value, forceOptional)))
      .join(",\n")}`;
  }

  private generateMember(node: TypeElement, forceOptional: boolean): string[] {
    const name = node.name!.getText();
    let typeName = getMemberType(this.checker, node);
    let annotation: string | undefined;
    if (typeName === InternalSymbolName.Type) {
      typeName = title(name);
    }
    if (this.martok.config.options?.dates?.namePattern?.exec(name)?.length) {
      typeName = "kotlinx.datetime.Instant";
      annotation =
        "@Serializable(with = kotlinx.datetime.serializers.InstantIso8601Serializer::class)";
    }

    const optional = forceOptional || node.questionToken ? "? = null" : "";
    const result = `val ${name}: ${typeName}${optional}`;
    return _.compact([annotation, result]);
  }

  private generateInnerClasses(
    name: string,
    members: ReadonlyArray<TypeElement>
  ): string {
    const anonymousTypes = members.filter(
      (value) => getMemberType(this.checker, value) === InternalSymbolName.Type
    );
    if (!anonymousTypes?.length) return "";
    try {
      this.innerClassNameStack.push(name);
      return ` {
${anonymousTypes
  .flatMap((value) => this.generateInnerClass(value))
  .map((value) => indentString(value, 2))
  .join("\n")}
}`;
    } finally {
      this.innerClassNameStack.pop();
    }
  }

  private generateInnerClass(member: TypeElement): string[] {
    const name = title(member.name!.getText());
    if (isPropertySignature(member)) {
      const type = member.type!;
      // inner anonymous types
      if (isTypeLiteralNode(type)) {
        return this.generate(name, type.members);
      }
      if (isUnionTypeNode(type)) {
        if (
          all(type.types, (value) => {
            const type = this.checker.getTypeFromTypeNode(value);
            return type.isStringLiteral() || type.isNumberLiteral();
          })
        ) {
          return this.martok.declarations.enums.generate(
            [...this.innerClassNameStack, name],
            type
          );
        }
      }
      return this.martok.declarations.types.generateFromTypeNode(name, type)!;
    }
    throw new Error(`Can't transpile property ${name}`);
  }
}
