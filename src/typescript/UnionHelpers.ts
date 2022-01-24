import { TypeChecker, TypeElement } from "typescript";
import { getMemberType } from "./MemberHelpers";
import { TaggedUnionError } from "../errors/TaggedUnionError";
import { all } from "./utils";

export const ErrorDiscriminate = `Can't have fully discriminated unions/intersections yet...`;

/**
 * @throws TaggedUnionError
 * @param checker
 * @param types
 * @param isTaggedUnion
 */
export function dedupeUnion(
  checker: TypeChecker,
  types: ReadonlyArray<TypeElement>,
  isTaggedUnion: boolean
): ReadonlyArray<TypeElement> {
  const seen = new Set<string>();
  return types.filter((value) => {
    const compatible = all(types, (value1) => {
      return typesAreCompatible(value, value1, checker);
    });
    if (!compatible) {
      if (!isTaggedUnion) {
        throw new TaggedUnionError();
      }
    } else {
      const name = value.name!.getText();
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
  checker: TypeChecker
): boolean {
  const name1 = value1.name!.getText();
  const name2 = value2.name!.getText();
  if (name1 !== name2) return true;
  const type1 = getMemberType(checker, value1);
  const type2 = getMemberType(checker, value2);
  return type1 === type2;
}
