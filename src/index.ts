import yargs from "yargs";
import { noop } from "lodash";
import { glob } from "glob";
import util from "util";
import { Martok, MartokConfig } from "./martok/Martok";
import { MartokWriter } from "./martok/MartokWriter";
import * as fs from "fs";
import * as path from "path";
import { MartokV2 } from "./v2/MartokV2";

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
  const isDir = (await fs.promises.lstat(args.path)).isDirectory();
  const files = isDir
    ? await getFiles(`${args.path}/**/*.{ts,d.ts}`)
    : [args.path];
  const rootDir = isDir ? args.path : path.dirname(args.path);
  const config: MartokConfig = {
    files,
    output: args.out,
    package: args.package,
    sourceRoot: rootDir,
  };
  const v2 = new MartokV2(config);
  const out = await v2.generateOutput();
  // const martok = new Martok(config);
  // const writer = new MartokWriter(martok);
  // const output = await martok.transpile();
  // await writer.writeToFileSystem(output, args.out);
  // writer.writeToConsole(output);
  console.log(`Finished`);
}

const { argv } = args.command(
  "$0 <path>",
  "Convert a file to kotlin",
  noop,
  transpile
);
