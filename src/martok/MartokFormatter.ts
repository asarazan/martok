import { MartokOutFile } from "./MartokOutFile";
import { StandardKotlinImports } from "../kotlin/StandardKotlinImports";
import { MartokConfig } from "./MartokConfig";

export class MartokFormatter {
  public constructor(private readonly config: MartokConfig) {}

  public generateSingleFile(file: MartokOutFile): string {
    return `package ${file.package}

${file.text.imports.join("\n")}

${file.text.declarations.join("\n")}`;
  }

  public generateMultiFile(files: MartokOutFile[]): string {
    return `package ${this.config.package}

${StandardKotlinImports}

${files.flatMap((value) => value.text.declarations).join("\n")}`;
  }
}
