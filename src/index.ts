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

export type QualifiedType<T> = {
  file: SourceFile;
  type: T;
};

export type Type = {
  name: string;
};

async function fromInterface(
  file: SourceFile,
  decl: InterfaceDeclaration
): Promise<QualifiedType<Type>> {
  console.log(`Found ${decl.name.text}`);
  return {
    file,
    type: {
      name: decl.name.text,
    },
  };
}

async function transpile(args: TranspileSingleArgs) {
  console.log(`Transpile: `, args);
  console.log(`pwd: ${process.cwd()}`);
  const program = ts.createProgram([args.path], {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
  const file = program.getSourceFile(args.path)!;

  // Loop through the root AST nodes of the file
  ts.forEachChild(file, async (node) => {
    switch (node.kind) {
      case ts.SyntaxKind.InterfaceDeclaration:
        await new InterfacePrinter(program).print(node as InterfaceDeclaration);
        // types.push(await fromInterface(file!, node as InterfaceDeclaration));
        break;
    }
  });
}

const { argv } = args.command(
  "$0 <path>",
  "Convert a file to kotlin",
  noop,
  transpile
);
