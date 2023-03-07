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
  private readonly checker;
  public constructor(private readonly martok: Martok) {
    this.checker = this.martok.program.getTypeChecker();
  }

  public generateImports(statements: ReadonlyArray<Statement>): string[] {
    const symbols: ts.Symbol[] = [];
    for (const statement of statements) {
      if (!isImportDeclaration(statement)) continue;
      symbols.push(...this.getSymbolsFromImport(statement));
    }
    return this.generateImportsFromSymbols(symbols);
  }

  public generateImportsFromSymbols(symbols: ts.Symbol[]): string[] {
    return symbols
      .map((value) => {
        const decl = _.first(value.declarations)!;
        const source = decl.getSourceFile();
        const pkg = this.martok.getFilePackage(source);
        return `import ${pkg}.${value.getEscapedName()}`;
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
