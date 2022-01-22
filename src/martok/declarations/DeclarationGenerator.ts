import { Martok } from "../Martok";
import { SourceFile, Statement } from "typescript";
import { InterfaceGenerator } from "./InterfaceGenerator";
import { TypeAliasGenerator } from "./TypeAliasGenerator";
import { EnumGenerator } from "./EnumGenerator";
import { TaggedUnionGenerator } from "./TaggedUnionGenerator";
import { KlassGenerator } from "./KlassGenerator";
import _, { values } from "lodash";
import { KlassPrinter } from "../../kotlin/KlassPrinter";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;

export class DeclarationGenerator {
  public readonly enums = new EnumGenerator(this.martok);
  public readonly types = new TypeAliasGenerator(this.martok);
  public readonly interfaces = new InterfaceGenerator(this.martok);
  public readonly taggedUnions = new TaggedUnionGenerator(this.martok);

  public readonly klasses = new KlassGenerator(this.martok);
  public readonly printer = new KlassPrinter();

  public constructor(private readonly martok: Martok) {}

  public generateDeclarations(file: SourceFile): string[] {
    const statements = file.statements.flatMap((value) =>
      this.generateDeclaration(value)
    );
    const parted = _.partition(
      statements,
      (value) => typeof value === "string"
    );
    const result = [...parted[0], ...parted[1]];
    return result.map((value) =>
      typeof value === "string" ? value : this.printer.print(value)
    );
  }

  private generateDeclaration(node: Statement): Klass | string {
    if (!KlassGenerator.isSupportedDeclaration(node)) {
      throw new Error(`Can't handle type ${node.kind}`);
    }
    return this.klasses.generate(node);
  }
}
