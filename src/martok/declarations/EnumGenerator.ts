import { Martok } from "../Martok";
import {
  EnumDeclaration,
  isEnumDeclaration,
  isStringLiteral,
  isUnionTypeNode,
  Node,
  TypeNode,
  UnionTypeNode,
} from "typescript";
import { StringEnumGenerator } from "./StringEnumGenerator";
import { OrdinalEnumGenerator } from "./OrdinalEnumGenerator";
import { all } from "../../typescript/utils";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;

export class EnumGenerator {
  private readonly strings = new StringEnumGenerator(this.martok);
  private readonly ordinals = new OrdinalEnumGenerator(this.martok);

  private readonly checker = this.martok.program.getTypeChecker();

  public constructor(private readonly martok: Martok) {}

  public canGenerate(type: Node): type is UnionTypeNode | EnumDeclaration {
    if (isUnionTypeNode(type)) {
      return all(type.types, (value) => {
        const type = this.checker.getTypeFromTypeNode(value);
        return type.isStringLiteral() || type.isNumberLiteral();
      });
    }
    return !!isEnumDeclaration(type);
  }

  public generate(
    name: string[],
    node: UnionTypeNode | EnumDeclaration
  ): string[] {
    const generator = this.isStringEnum(node) ? this.strings : this.ordinals;
    return generator.generate(name, node);
  }

  public generateKlass(
    name: string,
    node: UnionTypeNode | EnumDeclaration
  ): Klass {
    const generator = this.isStringEnum(node) ? this.strings : this.ordinals;
    return generator.generateKlass(name, node);
  }

  private isStringEnum(node: UnionTypeNode | EnumDeclaration): boolean {
    if (isEnumDeclaration(node)) {
      const types = node.members;
      return all(types, (value) => {
        return value.initializer ? isStringLiteral(value.initializer) : false;
      });
    }
    return all(node.types, (value) => {
      const type = this.checker.getTypeFromTypeNode(value);
      return type.isStringLiteral();
    });
  }
}
