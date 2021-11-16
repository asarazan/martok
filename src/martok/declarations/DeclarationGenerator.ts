import { Martok } from "../Martok";
import {
  Declaration,
  DeclarationStatement,
  isInterfaceDeclaration,
  isTypeAliasDeclaration,
  NamedDeclaration,
  Node,
  SourceFile,
  Statement,
} from "typescript";
import { InterfaceGenerator } from "./InterfaceGenerator";
import { TypeAliasGenerator } from "./TypeAliasGenerator";

export class DeclarationGenerator {
  private readonly interfaces = new InterfaceGenerator(this.martok);
  private readonly types = new TypeAliasGenerator(this.martok);
  public constructor(private readonly martok: Martok) {}

  public generateDeclarations(file: SourceFile): string[] {
    return file.statements.flatMap((value) => this.generateDeclaration(value));
  }

  public generateDeclaration(node: Statement): string[] {
    if (isInterfaceDeclaration(node)) {
      console.log(`-->Statement: ${node.name.escapedText}...`);
      return this.interfaces.generate(node);
    } else if (isTypeAliasDeclaration(node)) {
      console.log(`-->Statement: ${node.name.escapedText}...`);
      return this.types.generate(node);
    }
    throw new Error(`Can't parse statement: ${node.kind}`);
  }
}
