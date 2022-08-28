import { MartokOutFile } from "./MartokOutFile";
import { StandardKotlinImports } from "../kotlin/StandardKotlinImports";
import { MartokConfig } from "./MartokConfig";
import { KlassPrinter } from "../kotlin/KlassPrinter";

export class MartokFormatter {
  private readonly printer = KlassPrinter.instance;

  public constructor(private readonly config: MartokConfig) {}

  public generateSingleFile(file: MartokOutFile): string {
    return `package ${file.package}

${file.text.imports.join("\n")}

${file.text.declarations
  .map((value) =>
    this.printer.print(value, {
      pkg: file.package,
    })
  )
  .join("\n")}`;
  }

  public generateMultiFile(files: MartokOutFile[]): string {
    return `package ${this.config.package}

${StandardKotlinImports}

${files
  .flatMap((value) =>
    value.text.declarations.map((value) =>
      this.printer.print(value, {
        pkg: this.config.package,
      })
    )
  )
  .join("\n")}`;
  }
}
