import {
  isLiteralTypeNode,
  isStringLiteral,
  isStringLiteralLike,
  isTypeReferenceNode,
  LiteralTypeNode,
  StringLiteral,
  StringLiteralType,
  TypeNode,
  TypeReferenceNode,
} from "typescript";
import { kotlin } from "../../kotlin/Klass";
import { Martok } from "../Martok";
import Klass = kotlin.Klass;

export class UtilityGenerator {
  public constructor(private readonly martok: Martok) {}

  public generate(name: string, type: TypeNode): kotlin.Klass | undefined {
    if (!isTypeReferenceNode(type)) return undefined;
    const typeName = type.typeName.getText();
    if (typeName === "Omit") return this.generateOmit(name, type);
    return undefined;
  }

  private generateOmit(name: string, type: TypeReferenceNode): Klass {
    const klasses = this.martok.declarations.klasses;
    const [base, ...args] = type.typeArguments!;
    const omitNames = args
      .filter((value) => isLiteralTypeNode(value))
      .map((value) => (value as LiteralTypeNode).literal)
      .map((value) => (value as StringLiteral).text);
    const omitSet = new Set(omitNames);
    const result = klasses.generate(base, {
      forceName: name,
    }) as Klass;
    result.setCtorArgs(
      ...result.ctor.filter((value) => !omitSet.has(value.name))
    );
    result.setMembers(
      ...result.members.filter((value) => !omitSet.has(value.name))
    );
    return result;
  }
}
