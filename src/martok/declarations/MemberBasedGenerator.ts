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
import { innerClassName } from "../NameGenerators";
import indentString from "indent-string";

export class MemberBasedGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  private innerClassNameStack: string[] = [];
  public constructor(private readonly martok: Martok) {}

  public generate(name: string, members: ReadonlyArray<TypeElement>): string[] {
    const result: string[] = [];
    result.push(`@Serializable
data class ${name}(
${members.map((value) => `  ${this.generateMember(value)}`).join(",\n")}
)${this.generateInnerClasses(name, members)}`);
    return result;
  }

  private generateMember(node: TypeElement): string {
    const name = node.name!.getText();
    let typeName = getMemberType(this.checker, node);
    if (typeName === InternalSymbolName.Type) {
      typeName = innerClassName(name);
    }
    const optional = node.questionToken ? "? = null" : "";
    return `val ${name}: ${typeName}${optional}`;
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
      return `{
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
    const name = innerClassName(member.name!.getText());
    if (isPropertySignature(member)) {
      const type = member.type!;
      // inner anonymous types
      if (isTypeLiteralNode(type)) {
        return this.generate(name, type.members);
      }
      // TODO why is this duplicated below?
      if (isUnionTypeNode(type)) {
        return this.martok.declarations.enums.generate(
          [...this.innerClassNameStack, name],
          type
        );
      }
      if (isIntersectionTypeNode(type) || isUnionTypeNode(type)) {
        return this.martok.declarations.types.generateFromTypeNode(name, type)!;
      }
    }
    throw new Error(`Can't transpile property ${name}`);
  }
}
