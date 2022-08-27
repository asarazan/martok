import { Martok } from "../Martok";
import { SourceFile, Statement } from "typescript";
import { KlassGenerator } from "./KlassGenerator";
import _ from "lodash";
import { KlassPrinter } from "../../kotlin/KlassPrinter";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;

export class DeclarationGenerator {
  public readonly klasses = new KlassGenerator(this.martok);
  public readonly printer = new KlassPrinter();

  public constructor(private readonly martok: Martok) {}

  public generateDeclarations(file: SourceFile): (Klass | string)[] {
    return _.compact(
      file.statements.flatMap((value) => this.generateDeclaration(value))
    );
  }

  private generateDeclaration(node: Statement): (Klass | string)[] {
    try {
      if (!KlassGenerator.isSupportedDeclaration(node)) {
        // throw new Error(`Can't handle type ${node.kind}`);
        return [];
      }
      const result = [this.klasses.generate(node)];
      if (this.martok.additionalDeclarations.length) {
        result.push(...this.martok.additionalDeclarations);
      }
      return result;
    } finally {
      this.martok.clearAdditionalDeclarations();
    }
  }
}
