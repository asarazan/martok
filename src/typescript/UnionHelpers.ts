import { Node, TypeElement } from "typescript";
import { getMemberType } from "./MemberHelpers";
import { TaggedUnionError } from "../errors/TaggedUnionError";
import { all } from "./utils";
import path from "path";
import { Martok } from "../martok/Martok";
import { getPropertyName } from "../martok/processing/PropertyName";

/**
 * @throws TaggedUnionError
 * @param martok
 * @param types
 * @param isTaggedUnion
 * @param node
 */
export function dedupeUnion(
  martok: Martok,
  types: ReadonlyArray<TypeElement>,
  isTaggedUnion: boolean,
  node: Node
): ReadonlyArray<TypeElement> {
  const seen = new Set<string>();
  return types.filter((value) => {
    const compatible = all(types, (value1) => {
      return typesAreCompatible(value, value1, martok);
    });
    if (!compatible) {
      if (!isTaggedUnion) {
        const filename = path.basename(node.getSourceFile().fileName);
        throw new TaggedUnionError(filename, node.getText());
      }
    } else {
      const name = getPropertyName(value.name)!;
      if (!seen.has(name)) {
        seen.add(name);
        return true;
      }
    }
    return false;
  });
}

function typesAreCompatible(
  value1: TypeElement,
  value2: TypeElement,
  martok: Martok
): boolean {
  const name1 = getPropertyName(value1.name)!;
  const name2 = getPropertyName(value2.name)!;
  if (name1 !== name2) return true;
  const memberType1 = getMemberType(martok, value1);
  const memberType2 = getMemberType(martok, value2);
  return memberType1.type === memberType2.type;
}
