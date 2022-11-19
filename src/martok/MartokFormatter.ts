import { MartokOutFile } from "./MartokOutFile";
import {
  StandardKotlinImports,
  StarKotlinImport,
} from "../kotlin/StandardKotlinImports";
import { MartokConfig } from "./MartokConfig";
import { KlassPrinter } from "../kotlin/KlassPrinter";
import { StandardFileHeader } from "../kotlin/StandardFileHeader";

export class MartokFormatter {
  private readonly printer = KlassPrinter.instance;

  public constructor(private readonly config: MartokConfig) {}

  public generateSingleFile(file: MartokOutFile): string {
    return `${StandardFileHeader}
package ${file.pkg}

${file.text.imports.join("\n")}

${file.text.declarations
  .map((value) => this.printer.print(value, 0, this.config.options))
  .join("\n")}`;
  }

  public generateMultiFile(files: MartokOutFile[]): string {
    return `${StandardFileHeader}
package ${this.config.package}

${this.config.options?.importStar ? StarKotlinImport : StandardKotlinImports}

${files
  .flatMap((value) =>
    value.text.declarations.map((value) =>
      this.printer.print(value, 0, this.config.options)
    )
  )
  .join("\n")}`;
  }
}
