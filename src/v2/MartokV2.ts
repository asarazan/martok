import * as ts from "typescript";
import { SourceFile } from "typescript";
import { MartokOutFile } from "./MartokOutFile";
import { MartokConfig } from "../martok/Martok";
import _ from "lodash";
import * as path from "path";
import { TsHelper } from "../typescript/TsHelper";
import { StandardKotlinImportList } from "../kotlin/StandardKotlinImports";
import { ImportGenerator } from "./ImportGenerator";
import { DeclarationGenerator } from "./declarations/DeclarationGenerator";

export class MartokV2 {
  public readonly program = ts.createProgram(this.config.files, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
  private readonly imports = new ImportGenerator(this);
  private readonly decls = new DeclarationGenerator(this);

  public constructor(public readonly config: MartokConfig) {}

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
        imports: [...StandardKotlinImportList, null],
        declarations: [],
      },
    };
    base.text.imports.push(...this.imports.generateImports(file));
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
