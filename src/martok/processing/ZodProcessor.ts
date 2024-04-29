import ts from "typescript";
import { Martok } from "../Martok";

export class ZodProcessor {
  public constructor(private readonly martok: Martok) {}
  public allowImportThrough(file: ts.SourceFile): boolean {
    if (!this.martok.config.options?.experimentalZodSupport) return false;
    return file.fileName.includes("/martok/node_modules/zod/lib/");
  }
}
