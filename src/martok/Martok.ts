import * as ts from "typescript";
import { SourceFile, Statement, TypeChecker } from "typescript";
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
import { AsyncLocalStorage } from "async_hooks";

type MartokState = {
  nameScope: string[];
  externalStatements: ts.Symbol[];
  additionalDeclarations: string[];
};

export class Martok {
  public readonly program = ts.createProgram(this.config.files, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });

  public readonly declarations = new DeclarationGenerator(this);
  public get checker(): TypeChecker {
    return this.program.getTypeChecker();
  }
  public get nameScope(): string[] {
    return this.storage.getStore()!.nameScope;
  }
  public get externalSymbols(): ts.Symbol[] {
    return this.storage.getStore()!.externalStatements;
  }
  public get additionalDeclarations(): string[] {
    return this.storage.getStore()!.additionalDeclarations;
  }

  private readonly storage = new AsyncLocalStorage<MartokState>();
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
        await fs.promises.mkdir(path.dirname(file), { recursive: true });
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
        .replace(/\./g, "/");
      const filename = `${outPath}${relativePath}/${title(file.name)}.kt`;
      result[filename] = this.formatter.generateSingleFile(file);
    }
    return result;
  }

  public generateOutput(): MartokOutFile[] {
    const state: MartokState = {
      nameScope: [],
      externalStatements: [],
      additionalDeclarations: [],
    };
    return this.storage.run(state, () =>
      _(this.config.files)
        .map((value) => this.processFile(this.program.getSourceFile(value)!))
        .compact()
        .value()
    );
  }

  public pushNameScope(scope: string) {
    this.nameScope.push(scope);
    // console.log(`>`, this.nameScope);
  }
  public popNameScope(): string {
    const result = this.nameScope.pop()!;
    // console.log(`>`, this.nameScope);
    return result;
  }

  public pushExternalSymbols(...statements: ts.Symbol[]) {
    this.externalSymbols.push(...statements);
  }

  public clearExternalSymbols() {
    this.externalSymbols.length = 0;
  }

  public clearAdditionalDeclarations() {
    this.additionalDeclarations.length = 0;
  }

  private processFile(file: SourceFile): MartokOutFile {
    console.log(`Process File: ${file.fileName}...`);
    const name = TsHelper.getBaseFileName(file.fileName);
    const pkg = this.getFilePackage(file);
    this.pushNameScope(pkg);
    const base: MartokOutFile = {
      name,
      package: pkg,
      text: {
        package: `package ${pkg}`,
        imports: [...StandardKotlinImportList],
        declarations: [],
      },
    };
    base.text.declarations.push(
      ...this.declarations.generateDeclarations(file)
    );
    const statements = [...file.statements];
    const symbols = [...this.externalSymbols];
    const imports = _.uniq([
      ...this.imports.generateImports(statements),
      ...this.imports.generateImportsFromSymbols(symbols),
    ]);
    if (imports.length) {
      base.text.imports.push(null, ...imports); // spacer
    }
    this.clearExternalSymbols();
    this.popNameScope();
    return base;
  }

  public getFilePackage(file: SourceFile): string {
    let relativePath = path.resolve(path.dirname(file.fileName));
    if (relativePath.startsWith(this.config.sourceRoot)) {
      relativePath = relativePath.slice(this.config.sourceRoot.length);
    }
    return `${this.config.package}${relativePath.replace(/\//g, ".")}`;
  }
}
