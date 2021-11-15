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

  private generateMember(node: TypeElement): string {
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
    } else {
      const symbol = type.aliasSymbol ?? type.getSymbol()!;
      typeName = symbol.getEscapedName()!;
    }
    const optional = node.questionToken ? "? = null" : "";
    return `val ${node.name?.getText()}: ${typeName}${optional}`;
  }
}
