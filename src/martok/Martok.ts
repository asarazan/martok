import * as ts from "typescript";
import { SourceFile, TypeChecker } from "typescript";
import { MartokOutFile } from "./MartokOutFile";
import _ from "lodash";
import { TsHelper } from "../typescript/TsHelper";
import {
  StandardKotlinImportList,
  StarKotlinImport,
} from "../kotlin/StandardKotlinImports";
import { ImportGenerator } from "./ImportGenerator";
import { DeclarationGenerator } from "./declarations/DeclarationGenerator";
import * as fs from "fs";
import { MartokFormatter } from "./MartokFormatter";
import path from "path";
import { MartokConfig } from "./MartokConfig";
import { title } from "./NameGenerators";
import { AsyncLocalStorage } from "async_hooks";
import { TypeReplacer } from "./processing/TypeReplacer";
import { processSnakeCase } from "./processing/SnakeCase";
import { processOldNames } from "./processing/SanitizeNames";
import { TypeExpander } from "./processing/TypeExpander";
import { TsCompiler } from "./TsCompiler";

type MartokState = {
  nameScope: string[];
  externalStatements: ts.Symbol[];
  additionalDeclarations: string[];
  typeReplacer: TypeReplacer;
};

export class Martok {
  public readonly program: ts.Program;

  public readonly compiler = new TsCompiler(this.config);

  public readonly declarations;

  public readonly imports;

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
  public get typeReplacer(): TypeReplacer {
    return this.storage.getStore()!.typeReplacer;
  }

  private readonly storage;
  private readonly formatter;

  public constructor(public readonly config: MartokConfig) {
    const fsMap = new Map<string, string>();
    // Get all file raw text
    for (const file of this.config.files) {
      try {
        const result = fs.readFileSync(file, "utf-8");
        fsMap.set(file, result);
      } catch (e) {
        console.error(`Failed to read file ${file}: `, e);
      }
    }

    // Create initial program
    this.program = this.compiler.compileFiles(fsMap);
    this.imports = new ImportGenerator(this);

    if (this.config.options?.experimentalTypeExpanding) {
      this.program = new TypeExpander(this).expand();
    }

    this.declarations = new DeclarationGenerator(this);
    this.storage = new AsyncLocalStorage<MartokState>();
    this.formatter = new MartokFormatter(this.config);
  }

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
      const relativePath = file.pkg
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
      typeReplacer: new TypeReplacer(this),
    };
    return this.storage.run(state, () => {
      const result = _(this.config.files)
        .map((value) => this.processFile(this.program.getSourceFile(value)!))
        .compact()
        .value();
      if (this.config.options?.dedupeTaggedUnions ?? false) {
        state.typeReplacer.processOutput(result);
      }
      if (this.config.options?.snakeToCamelCase ?? false) {
        processSnakeCase(result);
      }
      processOldNames(result);
      return result;
    });
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
      pkg,
      text: {
        package: `package ${pkg}`,
        imports: [
          ...(this.config.options?.importStar
            ? [StarKotlinImport]
            : StandardKotlinImportList),
        ],
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
    } else {
      throw new Error(
        `${file.fileName} is not within the given source root, it can't be included in this project.`
      );
    }
    return `${this.config.package}${relativePath.replace(/\//g, ".")}`;
  }
}
