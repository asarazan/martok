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
  public constructor(private readonly martok: Martok) {}

  public generate(name: string, members: ReadonlyArray<TypeElement>): string[] {
    const result: string[] = [];
    result.push(`@Serializable
data class ${name}(
${members.map((value) => `  ${this.generateMember(value)}`).join(",\n")}
)${this.generateInnerClasses(members)}`);
    return result;
  }

  private generateMember(node: TypeElement): string {
    const name = this.getMemberName(node);
    let typeName = this.getMemberType(node);
    if (typeName === InternalSymbolName.Type) {
      typeName = innerClassName(name);
    }
    const optional = node.questionToken ? "? = null" : "";
    return `val ${name}: ${typeName}${optional}`;
  }

  private getMemberName(node: TypeElement): string {
    return node.name!.getText();
  }

  private getMemberType(node: TypeElement): string {
    if (!isPropertySignature(node)) throw new Error("Can't find property");
    return getMemberType(this.checker, node.type!);
  }

  private generateInnerClasses(members: ReadonlyArray<TypeElement>): string {
    const anonymousTypes = members.filter(
      (value) => this.getMemberType(value) === InternalSymbolName.Type
    );
    if (!anonymousTypes?.length) return "";
    return `{
${anonymousTypes
  .flatMap((value) => this.generateInnerClass(value))
  .map((value) => indentString(value, 2))
  .join("\n")}
}`;
  }

  private generateInnerClass(member: TypeElement): string[] {
    const name = innerClassName(this.getMemberName(member));
    if (isPropertySignature(member)) {
      const type = member.type!;
      // inner anonymous types
      if (isTypeLiteralNode(type)) {
        return this.generate(name, type.members);
      }
      if (isUnionTypeNode(type)) {
        return this.martok.declarations.enums.generate(name, type);
      }
      if (isIntersectionTypeNode(type) || isUnionTypeNode(type)) {
        return this.martok.declarations.types.generateFromTypeNode(name, type)!;
      }
    }
    throw new Error(`Can't transpile property ${name}`);
  }
}
