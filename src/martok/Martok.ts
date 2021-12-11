import * as ts from "typescript";
import { SourceFile } from "typescript";
import { MartokOutFile } from "./MartokOutFile";
import _ from "lodash";
import { TsHelper } from "../typescript/TsHelper";
import { StandardKotlinImportList } from "../kotlin/StandardKotlinImports";
import { ImportGenerator } from "./ImportGenerator";
import { DeclarationGenerator } from "./declarations/DeclarationGenerator";
import * as fs from "fs";
import { MartokFormatter } from "./MartokFormatter";
import path from "path";
import { MartokConfig } from "./MartokConfig";
import { title } from "./NameGenerators";

export class Martok {
  public readonly program = ts.createProgram(this.config.files, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });

  public readonly declarations = new DeclarationGenerator(this);

  private readonly imports = new ImportGenerator(this);
  private readonly formatter = new MartokFormatter(this.config);

  public constructor(public readonly config: MartokConfig) {}

  public async writeKotlinFiles(outPath: string) {
    if (outPath.endsWith(".kt")) {
      await fs.promises.writeFile(outPath, this.generateMultiFile());
    } else {
      const files = this.generateSingleFiles(outPath);
      const promises: Promise<unknown>[] = [];
      for (const file in files) {
        const contents = files[file]!;
        promises.push(
          fs.promises.mkdir(path.dirname(file), { recursive: true })
        );
        promises.push(fs.promises.writeFile(file, contents));
      }
      await Promise.allSettled(promises);
    }
  }

  public generateMultiFile(): string {
    return this.formatter.generateMultiFile(this.generateOutput());
  }

  public generateSingleFiles(outPath: string): Record<string, string> {
    const output = this.generateOutput();
    const result: Record<string, string> = {};
    for (const file of output) {
      const relativePath = file.package
        .slice(this.config.package.length)
        .replace(".", "/");
      const filename = `${outPath}${relativePath}/${title(file.name)}.kt`;
      result[filename] = this.formatter.generateSingleFile(file);
    }
    return result;
  }

  public generateOutput(): MartokOutFile[] {
    return _(this.config.files)
      .map((value) => this.processFile(this.program.getSourceFile(value)!))
      .compact()
      .value();
  }

  private processFile(file: SourceFile): MartokOutFile {
    console.log(`Process File: ${file.fileName}...`);
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
    const imports = this.imports.generateImports(file.statements);
    if (imports.length) {
      base.text.imports.push(null, ...imports); // spacer
    }
    base.text.declarations.push(
      ...this.declarations.generateDeclarations(file)
    );
    return base;
  }

  public getFilePackage(file: SourceFile): string {
    let relativePath = path.resolve(path.dirname(file.fileName));
    if (relativePath.startsWith(this.config.sourceRoot)) {
      relativePath = relativePath.slice(this.config.sourceRoot.length);
    }
    return `${this.config.package}${relativePath.replace("/", ".")}`;
  }
}
