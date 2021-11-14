import {
  ImportDeclaration,
  isImportDeclaration,
  isNamedImports,
  SourceFile,
  TypeChecker,
} from "typescript";
import * as ts from "typescript";
import _ from "lodash";
import { Martok } from "./Martok";

export class ImportGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

  public generateImports(file: SourceFile): string[] {
    const symbols: ts.Symbol[] = [];
    for (const statement of file.statements) {
      if (!isImportDeclaration(statement)) continue;
      symbols.push(...this.getSymbolsFromImport(statement));
    }
    return symbols.map((value) => {
      const decl = _.first(value.declarations)!;
      const source = decl.getSourceFile();
      const pkg = this.martok.getFilePackage(source);
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
}
