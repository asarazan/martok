import {
  Collection,
  isLiteralTypeNode,
  isStringLiteral,
  isStringLiteralLike,
  isTypeReferenceNode,
  isUnionTypeNode,
  LiteralTypeNode,
  StringLiteral,
  StringLiteralType,
  TypeNode,
  TypeReferenceNode,
} from "typescript";
import { kotlin } from "../../kotlin/Klass";
import { Martok } from "../Martok";
import Klass = kotlin.Klass;

const supportedTypes = ["Omit", "Pick", "Required", "Partial"];

export class UtilityGenerator {
  public constructor(private readonly martok: Martok) {}

  public generate(name: string, type: TypeNode): kotlin.Klass | undefined {
    if (!isTypeReferenceNode(type)) return undefined;

    const typeName = type.typeName.getText();
    if (!supportedTypes.includes(typeName)) return undefined;

    const [base, args] = type.typeArguments!;
    const memberNames = this.getNameUnion(args);

    const result = this.martok.declarations.klasses.generate(base, {
      forceName: name,
    }) as Klass;

    if (typeName === "Omit") {
      result.setCtorArgs(
        ...result.ctor.filter((value) => !memberNames.has(value.name))
      );
      result.setMembers(
        ...result.members.filter((value) => !memberNames.has(value.name))
      );
    }

    if (typeName === "Pick") {
      result.setCtorArgs(
        ...result.ctor.filter((value) => memberNames.has(value.name))
      );
      result.setMembers(
        ...result.members.filter((value) => memberNames.has(value.name))
      );
    }

    if (typeName === "Partial") {
      for (const value of result.ctor) {
        value.nullable = true;
        value.value = "null";
      }
      for (const value of result.members) {
        value.nullable = true;
        value.value = "null";
      }
    }

    if (typeName === "Required") {
      for (const value of result.ctor) {
        value.nullable = false;
        delete value.value;
      }
      for (const value of result.members) {
        value.nullable = false;
        delete value.value;
      }
    }
    return result;
  }

  private getNameUnion(type: TypeNode | undefined): Set<string> {
    if (type) {
      if (isLiteralTypeNode(type)) {
        return new Set([(type.literal as StringLiteral).text]);
      }
      if (isUnionTypeNode(type)) {
        return new Set(
          type.types.map(
            (value) =>
              ((value as LiteralTypeNode).literal as StringLiteral).text
          )
        );
      }
    }
    return new Set();
  }
}
