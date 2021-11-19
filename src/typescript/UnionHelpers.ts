import { TypeChecker, TypeElement, TypeNode } from "typescript";
import { getMemberType } from "./MemberHelpers";

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
      throw new Error(
        `Can't have fully discriminated unions/intersections yet...`
      );
    }
    return false;
  });
}
