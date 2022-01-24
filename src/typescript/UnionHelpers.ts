import { TypeChecker, TypeElement } from "typescript";
import { getMemberType } from "./MemberHelpers";
import { TaggedUnionError } from "../errors/TaggedUnionError";
import { all } from "./utils";

export const ErrorDiscriminate = `Can't have fully discriminated unions/intersections yet...`;
export type TaggedUnionBehavior = "throw" | "ignore";

/**
 * @throws TaggedUnionError
 * @param checker
 * @param types
 * @param taggedUnionBehavior
 */
export function dedupeUnion(
  checker: TypeChecker,
  types: ReadonlyArray<TypeElement>,
  taggedUnionBehavior: TaggedUnionBehavior = "throw"
): ReadonlyArray<TypeElement> {
  return types.filter((value) => {
    const compatible = all(types, (value1) => {
      return typesAreCompatible(value, value1, checker);
    });
    if (!compatible && taggedUnionBehavior === "throw") {
      throw new TaggedUnionError();
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
