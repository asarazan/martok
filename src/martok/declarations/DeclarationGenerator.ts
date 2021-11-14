import { Martok } from "../Martok";
import {
  isInterfaceDeclaration,
  isTypeAliasDeclaration,
  SourceFile,
} from "typescript";
import { InterfaceGenerator } from "./InterfaceGenerator";
import { TypeAliasGenerator } from "./TypeAliasGenerator";

export class DeclarationGenerator {
  private readonly interfaces = new InterfaceGenerator(this.martok);
  private readonly types = new TypeAliasGenerator(this.martok);
  public constructor(private readonly martok: Martok) {}

  public generateDeclarations(file: SourceFile): string[] {
    const result: string[] = [];
    for (const statement of file.statements) {
      if (isInterfaceDeclaration(statement)) {
        result.push(...this.interfaces.generate(statement));
      } else if (isTypeAliasDeclaration(statement)) {
        result.push(...this.types.generate(statement));
      }
    }

    return result;
  }
}
