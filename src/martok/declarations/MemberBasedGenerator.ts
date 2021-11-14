import { Martok } from "../Martok";
import { TypeElement } from "typescript";
import _ from "lodash";
import { INTRINSICS } from "../../typescript/IntrinsicType";

export class MemberBasedGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

  public generate(name: string, members: ReadonlyArray<TypeElement>): string[] {
    const result: string[] = [];
    result.push(`@Serializable
data class ${name}(
${members.map((value) => `  ${this.generateMember(value)}`).join(",\n")}
)
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
