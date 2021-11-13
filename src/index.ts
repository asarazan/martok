import * as ts from "typescript";
import yargs from "yargs";
import _, { noop } from "lodash";
import { InterfaceDeclaration, SourceFile } from "typescript";
import { InterfacePrinter } from "./InterfacePrinter";
import { glob } from "glob";
import util from "util";
import { StandardKotlinImports } from "./kotlin/StandardKotlinImports";

const args = yargs
  .scriptName("martok")
  .option("out", {
    alias: "o",
    type: "string",
    describe: "output file",
  })
  .default("package", "example", "the kotlin package name")
  .showHelpOnFail(true)
  .help()
  .strict()
  .strictCommands()
  .strictOptions();

export type TranspileSingleArgs = {
  path: string;
  out: string;
  package: string;
};

async function transpile(args: TranspileSingleArgs) {
  console.log(`Transpile: `, args);
  const getFiles = util.promisify(glob);
  const files = await getFiles(args.path);
  const program = ts.createProgram(files, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
  const decls: string[] = [];
  for (const file of files) {
    const source = program.getSourceFile(file)!;
    for (const node of source.statements) {
      const printer = new InterfacePrinter(program);
      switch (node.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.TypeAliasDeclaration:
          decls.push(printer.printType(node as InterfaceDeclaration));
          break;
      }
    }
  }

  console.log(
    `package ${args.package}

${StandardKotlinImports}

${decls.join("\n\n")}
`
  );
}

const { argv } = args.command(
  "$0 <path>",
  "Convert a file to kotlin",
  noop,
  transpile
);
