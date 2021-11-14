import { MartokV2 } from "../MartokV2";
import { isInterfaceDeclaration, SourceFile } from "typescript";
import { InterfaceGenerator } from "./InterfaceGenerator";

export class DeclarationGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  private readonly interfaces = new InterfaceGenerator(this.martok);
  public constructor(private readonly martok: MartokV2) {}

  public generateDeclarations(file: SourceFile): string[] {
    const result: string[] = [];
    for (const statement of file.statements) {
      if (isInterfaceDeclaration(statement)) {
        result.push(...this.interfaces.generate(statement));
      }
    }

    return result;
  }
}
