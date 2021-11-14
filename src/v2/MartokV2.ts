import * as ts from "typescript";
import { SourceFile } from "typescript";
import { MartokOutFile } from "./MartokOutFile";
import { MartokConfig } from "../martok/Martok";
import _ from "lodash";
import { TsHelper } from "../typescript/TsHelper";
import { StandardKotlinImportList } from "../kotlin/StandardKotlinImports";
import { ImportGenerator } from "./ImportGenerator";
import { DeclarationGenerator } from "./declarations/DeclarationGenerator";
import * as fs from "fs";
import { MartokFormatter } from "./MartokFormatter";
import path from "path";

export class MartokV2 {
  public readonly program = ts.createProgram(this.config.files, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
  private readonly imports = new ImportGenerator(this);
  private readonly decls = new DeclarationGenerator(this);
  private readonly formatter = new MartokFormatter(this.config);

  public constructor(public readonly config: MartokConfig) {}

  public async writeKotlinFiles() {
    const output = await this.generateOutput();
    const outPath = this.config.output;
    if (this.config.output.endsWith(".kt")) {
      const contents = this.formatter.generateMultiFile(output);
      await fs.promises.writeFile(outPath, contents);
    } else {
      for (const file of output) {
        const relativePath = file.package
          .slice(this.config.package.length)
          .replace(".", "/");
        const dir = `${this.config.output}${relativePath}`;
        await fs.promises.mkdir(dir, { recursive: true });
        const content = this.formatter.generateSingleFile(file);
        await fs.promises.writeFile(`${dir}/${file.name}.kt`, content);
      }
    }
  }

  public async generateOutput(): Promise<MartokOutFile[]> {
    return _(this.config.files)
      .map((value) => this.processFile(this.program.getSourceFile(value)!))
      .compact()
      .value();
  }

  private processFile(file: SourceFile): MartokOutFile {
    const name = TsHelper.getBaseFileName(file.fileName);
    const pkg = this.getFilePackage(file);
    const base: MartokOutFile = {
      name,
      package: pkg,
      text: {
        package: `package ${pkg}`,
        imports: [...StandardKotlinImportList],
        declarations: [],
      },
    };
    const imports = this.imports.generateImports(file);
    if (imports.length) {
      base.text.imports.push(null, ...imports); // spacer
    }
    base.text.declarations.push(...this.decls.generateDeclarations(file));
    return base;
  }

  public getFilePackage(file: SourceFile): string {
    let relativePath = path.dirname(file.fileName);
    if (relativePath.startsWith(this.config.sourceRoot)) {
      relativePath = relativePath.slice(this.config.sourceRoot.length);
    }
    return `${this.config.package}${relativePath.replace("/", ".")}`;
  }
}
