import ts, { isVariableDeclaration, isVariableStatement } from "typescript";
import { Martok } from "../Martok";

export class ZodProcessor {
  public constructor(private martok: Martok) {}

  public getType(statement: ts.Statement): ts.Type | undefined {
    if (!isVariableStatement(statement)) return undefined;
    try {
      const decl = statement.declarationList.declarations[0];
      if (!isVariableDeclaration(decl)) return undefined;
      const type = this.martok.checker.getTypeAtLocation(decl);
      const symbol = type.aliasSymbol ?? type.symbol;
      return symbol.getEscapedName() === "ZodObject" ? type : undefined;
    } catch (e: unknown) {
      console.error(e);
      return undefined;
    }
  }

  public shouldExpand(statement: ts.Statement) {
    return this.getType(statement) !== undefined;
  }
}
