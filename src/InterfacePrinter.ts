import {
  Identifier,
  InterfaceDeclaration,
  isOptionalTypeNode,
  Program,
  PropertySignature,
  TypeChecker,
} from "typescript";
import _ from "lodash";
import { PropertyHelper } from "./typescript/PropertyHelper";
import getPropertyName = PropertyHelper.getPropertyName;
import getPropertyType = PropertyHelper.getPropertyType;
import isPropertyOptional = PropertyHelper.isPropertyOptional;
import { Konverter } from "./kotlin/Konverter";
import createProperty = PropertyHelper.createProperty;

export class InterfacePrinter {
  private readonly checker: TypeChecker;
  public constructor(private readonly program: Program) {
    this.checker = this.program.getTypeChecker();
  }

  public async print(decl: InterfaceDeclaration) {
    console.log(`Found ${decl.name.text}`);
    const str = `import kotlinx.serialization.Serializable;

@Serializable
data class ${decl.name.text} (
${this.getMemberLines(decl)
  .map((value) => `  ${value};`)
  .join("\n")}
) {}
`;
    console.log(str);
  }

  private getMemberLines(decl: InterfaceDeclaration): string[] {
    const konverter = new Konverter(this.program);
    return _(decl.members)
      .map((value) => {
        const prop = createProperty(value);
        if (!prop) return undefined;
        return konverter.formatProperty(prop);
      })
      .compact()
      .value();
  }
}
