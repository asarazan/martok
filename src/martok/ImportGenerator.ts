import {
  ImportDeclaration,
  InternalSymbolName,
  isImportDeclaration,
  isNamedImports,
  Statement,
} from "typescript";
import * as ts from "typescript";
import _ from "lodash";
import { Martok } from "./Martok";

export class ImportGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

  public generateImports(statements: ReadonlyArray<Statement>): string[] {
    const symbols: ts.Symbol[] = [];
    for (const statement of statements) {
      if (!isImportDeclaration(statement)) continue;
      symbols.push(...this.getSymbolsFromImport(statement));
    }
    return this.generateImportsFromSymbols(symbols);
  }

  public generateImportsFromSymbols(symbols: (string | ts.Symbol)[]): string[] {
    return _.uniq(symbols)
      .map((value) => {
        if (typeof value === "string") {
          return `import ${value}`;
        }
        const decl = _.first(value.declarations)!;
        const source = decl.getSourceFile();
        const pkg = this.martok.getFilePackage(source);
        return `import ${pkg}.${value.getEscapedName() as string}`;
      })
      .filter((value) => !value.endsWith(`.${InternalSymbolName.Type}`));
  }

  private getSymbolsFromImport(imp: ImportDeclaration): ts.Symbol[] {
    const result: ts.Symbol[] = [];
    const bindings = imp.importClause?.namedBindings;
    if (!bindings) return [];
    if (isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        let symbol = this.checker.getSymbolAtLocation(element.name)!;
        symbol = this.checker.getAliasedSymbol(symbol) ?? symbol;
        result.push(symbol);
      }
    }
    return result;
  }
}
