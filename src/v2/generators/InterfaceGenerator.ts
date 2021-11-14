import { MartokV2 } from "../MartokV2";
import { InterfaceDeclaration, TypeElement } from "typescript";
import _ from "lodash";
import { INTRINSICS } from "../../typescript/IntrinsicType";

export class InterfaceGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: MartokV2) {}

  public generate(node: InterfaceDeclaration): string[] {
    const result: string[] = [];
    const members = node.members;
    result.push(`@Serializable
data class ${node.name.escapedText}(
${members.map((value) => `  ${this.generateMember(value)}`).join(",\n")}
) {}
`);
    return result;
  }

  private generateMember(member: TypeElement): string {
    const type = this.checker.getTypeAtLocation(member);
    let name!: string;
    if (_.has(type, "intrinsicName")) {
      name = (type as any).intrinsicName;
      name = INTRINSICS[name];
      if (!name) {
        throw new Error(
          `Unsupported Intrinsic: ${(type as any).intrinsicName}`
        );
      }
    } else {
      const symbol = type.getSymbol()!;
      name = symbol.getEscapedName()!;
    }
    const optional = member.questionToken ? "? = null" : "";
    return `${member.name?.getText()}: ${name}${optional}`;
  }
}
