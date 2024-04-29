import ts from "typescript";

export class ZodProcessor {
  public static allowImportThrough(file: ts.SourceFile): boolean {
    return file.fileName.includes("/martok/node_modules/zod/lib/");
  }
}
