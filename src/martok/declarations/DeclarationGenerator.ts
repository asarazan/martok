import { Martok } from "../Martok";
import {
  isEnumDeclaration,
  isInterfaceDeclaration,
  isTypeAliasDeclaration,
  SourceFile,
  Statement,
} from "typescript";
import { InterfaceGenerator } from "./InterfaceGenerator";
import { TypeAliasGenerator } from "./TypeAliasGenerator";
import { EnumGenerator } from "./EnumGenerator";
import { TaggedUnionGenerator } from "./TaggedUnionGenerator";

export class DeclarationGenerator {
  public readonly enums = new EnumGenerator(this.martok);
  public readonly types = new TypeAliasGenerator(this.martok);
  public readonly interfaces = new InterfaceGenerator(this.martok);
  public readonly taggedUnions = new TaggedUnionGenerator(this.martok);

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
    } else if (isEnumDeclaration(node)) {
      console.log(`-->Statement: ${node.name.escapedText}...`);
      return this.enums.generate([node.name.escapedText!], node);
    }
    // Skipping unrecognized statements, should be fine.
    return [];
  }
}
