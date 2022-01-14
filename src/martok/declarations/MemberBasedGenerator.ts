import { Martok } from "../Martok";
import {
  InternalSymbolName,
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

export type MemberOptions = {
  optional?: boolean;
  abstract?: boolean;
};

export class MemberBasedGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  private innerClassNameStack: string[] = [];
  public constructor(private readonly martok: Martok) {}

  public generate(
    name: string,
    members: ReadonlyArray<TypeElement>,
    options?: MemberOptions
  ): string[] {
    const result: string[] = [];
    const serializer = "";
    const header = this.classHeader(name, serializer, options);
    result.push(`@Serializable
data class ${name}(
${this.generateMembers(members, options)}
)${this.generateInnerClasses(name, members)}`);
    return result;
  }

  public generateMembers(
    members: ReadonlyArray<TypeElement>,
    options?: MemberOptions
  ): string {
    return `${members
      .map((value) => this.formatMember(this.generateMember(value, options)))
      .join(",\n")}`;
  }

  public formatMember(member: string[]): string {
    return member.map((value) => `  ${value}`).join("\n");
  }

  public generateMember(node: TypeElement, options?: MemberOptions): string[] {
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

    const optional = options?.optional || node.questionToken ? "? = null" : "";
    const result = `${
      options?.abstract ? "abstract " : ""
    }val ${name}: ${typeName}${optional}`;
    return _.compact([annotation, result]);
  }

  public generateInnerClasses(
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

  private classAnnotation(serializer?: string): string {
    let result = `@Serializable`;
    if (serializer?.length) result = `${result}(with = ${serializer})`;
    return result;
  }

  private classHeader(
    name: string,
    serializer?: string,
    options?: MemberOptions
  ): string {
    const annotation = this.classAnnotation(serializer);
    const modifier = options?.abstract ? "abstract" : "data";
    return `${annotation}\n${modifier} class ${name}`;
  }
}
