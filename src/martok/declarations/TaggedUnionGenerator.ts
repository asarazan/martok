import { Martok } from "../Martok";
import { UnionTypeNode } from "typescript";
import { getMembers } from "../../typescript/MemberHelpers";

export class TaggedUnionGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

  public generate(node: UnionTypeNode): string[] {
    const allTypes = node.types;
    const allMembers = node.types.map((value) =>
      getMembers(value, this.checker)
    );
    return ["Testing"];
  }
}
