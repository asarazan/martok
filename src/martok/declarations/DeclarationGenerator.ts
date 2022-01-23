import { Martok } from "../Martok";
import { SourceFile, Statement } from "typescript";
import { KlassGenerator } from "./KlassGenerator";
import _ from "lodash";
import { KlassPrinter } from "../../kotlin/KlassPrinter";

export class DeclarationGenerator {
  public readonly klasses = new KlassGenerator(this.martok);
  public readonly printer = new KlassPrinter();

  public constructor(private readonly martok: Martok) {}

  public generateDeclarations(file: SourceFile): string[] {
    return _.compact(
      file.statements.map((value) => this.generateDeclaration(value))
    );
  }

  private generateDeclaration(node: Statement): string | undefined {
    if (!KlassGenerator.isSupportedDeclaration(node)) {
      // throw new Error(`Can't handle type ${node.kind}`);
      return undefined;
    }
    const value = this.klasses.generate(node);
    return typeof value === "string" ? value : this.printer.print(value);
  }
}
