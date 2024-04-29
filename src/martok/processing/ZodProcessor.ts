import ts, { isVariableStatement } from "typescript";
import { Martok } from "../Martok";

export class ZodProcessor {
  public constructor(private martok: Martok) {}

  public isZodImport(file: ts.SourceFile): boolean {
    return file.fileName.includes("/martok/node_modules/zod/lib/");
  }

  public isZodStatement(node: ts.Node): boolean {
    return true; // TODO
  }
}
