import * as ts from "typescript";
import yargs from "yargs";
import _, { noop } from "lodash";
import { InterfaceDeclaration, SourceFile } from "typescript";
import { InterfacePrinter } from "./InterfacePrinter";

const args = yargs
  .scriptName("martok")
  .option("out", {
    alias: "o",
    type: "string",
    describe: "output file",
  })
  .showHelpOnFail(true)
  .help()
  .strict()
  .strictCommands()
  .strictOptions();

export type TranspileSingleArgs = {
  path: string;
  out: string;
};

async function transpile(args: TranspileSingleArgs) {
  console.log(`Transpile: `, args);
  const program = ts.createProgram([args.path], {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
  const file = program.getSourceFile(args.path)!;

  const decls: string[] = [];
  for (const node of file.statements) {
    const printer = new InterfacePrinter(program);
    switch (node.kind) {
      case ts.SyntaxKind.InterfaceDeclaration:
      case ts.SyntaxKind.TypeAliasDeclaration:
        decls.push(printer.printType(node as InterfaceDeclaration));
        break;
    }
  }
  console.log(`package foo // TODO

import kotlinx.serialization.Serializable

${decls.join("\n\n")}
`);
}

const { argv } = args.command(
  "$0 <path>",
  "Convert a file to kotlin",
  noop,
  transpile
);
