import * as ts from "typescript";
import {
  ImportDeclaration,
  isImportDeclaration,
  isInterfaceDeclaration,
  isNamedImports,
  isPropertyDeclaration,
  isPropertySignature,
  SourceFile,
} from "typescript";
import { MartokOutFile } from "./MartokOutFile";
import { MartokConfig } from "../martok/Martok";
import _ from "lodash";
import * as path from "path";
import { TsHelper } from "../typescript/TsHelper";
import { StandardKotlinImportList } from "../kotlin/StandardKotlinImports";

export class MartokV2 {
  private readonly program = ts.createProgram(this.config.files, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
  private readonly checker = this.program.getTypeChecker();
  public constructor(private readonly config: MartokConfig) {}

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
    base.text.imports.push(...this.generateImportList(file));
    return base;
  }

  private getFilePackage(file: SourceFile): string {
    let relativePath = path.dirname(file.fileName);
    if (relativePath.startsWith(this.config.sourceRoot)) {
      relativePath = relativePath.slice(this.config.sourceRoot.length);
    }
    return `${this.config.package}${relativePath.replace("/", ".")}`;
  }

  private generateImportList(file: SourceFile): string[] {
    const symbols: ts.Symbol[] = [];
    for (const statement of file.statements) {
      if (!isImportDeclaration(statement)) continue;
      symbols.push(...this.getSymbolsFromImport(statement));
    }
    return symbols.map((value) => {
      const decl = _.first(value.declarations)!;
      const file = decl.getSourceFile();
      const pkg = this.getFilePackage(file);
      return `import ${pkg}.${value.getEscapedName()}`;
    });
  }

  private getSymbolsFromImport(imp: ImportDeclaration): ts.Symbol[] {
    const result: ts.Symbol[] = [];
    const bindings = imp.importClause?.namedBindings;
    if (!bindings) return [];
    if (isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        let symbol = this.checker.getSymbolAtLocation(element.name);
        if (!symbol) continue;
        symbol = this.checker.getAliasedSymbol(symbol) ?? symbol;
        result.push(symbol);
      }
    }
    return result;
  }

  // private getImportFromSymbol(symbol: ts.Symbol): string {}
}
