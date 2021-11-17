import { Martok } from "../Martok";
import {
  InternalSymbolName,
  isIntersectionTypeNode,
  isPropertySignature,
  isStringLiteral,
  isTypeAliasDeclaration,
  isTypeLiteralNode,
  isUnionTypeNode,
  TypeElement,
} from "typescript";
import _ from "lodash";
import { INTRINSICS } from "../../typescript/IntrinsicType";
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
    if (typeName === "__type") {
      // this *should* mean it's an inner class. Need to check edge cases.
      typeName = innerClassName(name);
    }
    const optional = node.questionToken ? "? = null" : "";
    return `val ${name}: ${typeName}${optional}`;
  }

  private getMemberName(node: TypeElement): string {
    return node.name!.getText();
  }

  private getMemberType(node: TypeElement): string {
    const type = this.checker.getTypeAtLocation(node);
    let typeName!: string;
    if (_.has(type, "intrinsicName")) {
      typeName = (type as any).intrinsicName;
      typeName = INTRINSICS[typeName];
      if (!typeName) {
        throw new Error(
          `Unsupported Intrinsic: ${(type as any).intrinsicName}`
        );
      }
    } else if (isPropertySignature(node)) {
      if (isStringLiteral(node.type!)) {
        typeName = "String";
      } else if (
        isUnionTypeNode(node.type!) ||
        isIntersectionTypeNode(node.type!)
      ) {
        typeName = InternalSymbolName.Type;
      }
    } else {
      const symbol = type.aliasSymbol ?? type.getSymbol();
      if (!symbol) {
        throw new Error(`Cannot find symbol`);
      }
      typeName = symbol.getEscapedName()!;
    }
    return typeName;
  }

  private generateInnerClasses(members: ReadonlyArray<TypeElement>): string {
    const anonymousTypes = members.filter(
      (value) => this.getMemberType(value) === "__type"
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
    }
    throw new Error(`Can't transpile property ${name}`);
  }
}
