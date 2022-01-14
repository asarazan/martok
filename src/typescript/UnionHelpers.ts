import { TypeChecker, TypeElement } from "typescript";
import { getMemberType } from "./MemberHelpers";
import { TaggedUnionError } from "../errors/TaggedUnionError";

export const ErrorDiscriminate = `Can't have fully discriminated unions/intersections yet...`;

/**
 * @throws TaggedUnionError
 * @param checker
 * @param types
 */
export function dedupeUnion(
  checker: TypeChecker,
  types: ReadonlyArray<TypeElement>
): ReadonlyArray<TypeElement> {
  const map: Record<string, TypeElement> = {};
  return types.filter((value) => {
    const type = getMemberType(checker, value);
    const existing = map[value.name!.getText()];
    if (!existing) {
      map[value.name!.getText()] = value;
      return true;
    }
    if (getMemberType(checker, existing) !== type) {
      throw new TaggedUnionError();
    }
    return false;
  });
}
