import {
  EnumDeclaration,
  ImportDeclaration,
  InternalSymbolName,
  isEnumMember,
  isImportDeclaration,
  isNamedImports,
  SourceFile,
  Statement,
} from "typescript";
import * as ts from "typescript";
import _ from "lodash";
import { Martok } from "./Martok";
import { bestDeclaration } from "../typescript/MemberHelpers";

export class ImportGenerator {
  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

  public generateImports(
    file: SourceFile,
    statements: ReadonlyArray<Statement>
  ): string[] {
    const symbols: ts.Symbol[] = [];
    for (const statement of statements) {
      if (!isImportDeclaration(statement)) continue;
      symbols.push(...this.getSymbolsFromImport(statement));
    }
    return _.compact(this.generateImportsFromSymbols(file, symbols));
  }

  public generateImportsFromSymbols(
    file: SourceFile,
    symbols: ts.Symbol[]
  ): string[] {
    const result = symbols
      .map((value) => {
        let decl = bestDeclaration(value)!;
        let name = value.getEscapedName().toString();
        if (isEnumMember(decl)) {
          name = decl.parent.name.escapedText.toString();
          decl = decl.parent;
        }
        const source = decl.getSourceFile();
        const pkg = this.martok.getFilePackage(source);
        if (pkg === this.martok.getFilePackage(file)) {
          return undefined; // you don't need to import these.
        }
        return `import ${pkg}.${name}`;
      })
      .filter((value) => !value?.endsWith(`.${InternalSymbolName.Type}`));
    return _.compact(result);
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
