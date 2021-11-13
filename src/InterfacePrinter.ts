import {
  InterfaceDeclaration,
  isInterfaceDeclaration,
  isTypeAliasDeclaration,
  NodeArray,
  Program,
  TypeAliasDeclaration,
  TypeChecker,
  TypeElement,
  TypeLiteralNode,
} from "typescript";
import _ from "lodash";
import { PropertyHelper } from "./typescript/PropertyHelper";

import { Konverter } from "./kotlin/Konverter";

export class InterfacePrinter {
  private readonly checker: TypeChecker;
  public constructor(private readonly program: Program) {
    this.checker = this.program.getTypeChecker();
  }

  public printType(decl: InterfaceDeclaration | TypeAliasDeclaration) {
    return `@Serializable
data class ${decl.name.text} (
${this.getMemberLines(decl)
  .map((value) => `  ${value};`)
  .join("\n")}
) {}`;
  }

  private getMemberLines(
    decl: InterfaceDeclaration | TypeAliasDeclaration
  ): string[] {
    const konverter = new Konverter(this.program);
    const helper = new PropertyHelper(this.program);
    let members: ReadonlyArray<TypeElement> = [];
    if (isInterfaceDeclaration(decl)) {
      members = decl.members;
    } else if (isTypeAliasDeclaration(decl)) {
      const type = decl.type as TypeLiteralNode;
      members = type.members;
    }
    return _(members)
      .map((value) => {
        const prop = helper.propertyFromElement(value);
        if (!prop) return undefined;
        return konverter.formatProperty(prop);
      })
      .compact()
      .value();
  }
}
