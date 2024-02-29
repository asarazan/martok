#!/usr/bin/env node

import yargs from "yargs";
import { noop } from "lodash";
import { glob } from "glob";
import util from "util";
import * as fs from "fs";
import * as path from "path";
import { MartokConfig } from "./martok/MartokConfig";
import { Martok } from "./martok/Martok";

const args = yargs
  .scriptName("martok")
  .option("out", {
    alias: "o",
    type: "string",
    describe: "output file",
  })
  .option("package", {
    alias: "p",
    type: "string",
    describe: "the kotlin package name",
    default: "example",
  })
  .option("dedupeTaggedUnions", {
    alias: "t",
    type: "boolean",
    default: false,
    describe:
      "Experimental feature that will try to remove any component types of a tagged union and replace references with the optimized class.",
  })
  .option("snakeToCamelCase", {
    alias: "s",
    type: "boolean",
    default: false,
    describe: "convert json-friendly snake_case to Kotlin-friendly camelCase",
  })
  .option("annotationNewLines", {
    alias: "a",
    type: "boolean",
    default: false,
    describe:
      "Aesthetic option to always put a newline between annotations and declarations",
  })
  .option("importStar", {
    alias: "i",
    type: "boolean",
    default: false,
    describe: "Just throw in an import kotlinx.serialization.*",
  })
  .showHelpOnFail(true)
  .help()
  .strict()
  .strictCommands()
  .strictOptions();

export type TranspileSingleArgs = {
  path: string;
  out: string;
  package: string;
  datePattern: string;
  dedupeTaggedUnions: boolean;
  snakeToCamelCase: boolean;
  annotationNewLines: boolean;
  importStar: boolean;
};

async function transpile(args: TranspileSingleArgs) {
  console.log(`Transpile: `, args);
  const getFiles = util.promisify(glob);
  const isDir = (await fs.promises.lstat(args.path)).isDirectory();
  const pattern = isDir ? `${args.path}/**/*.{ts,d.ts}` : args.path;
  let files = await getFiles(pattern);
  const rootDir = path.resolve(isDir ? args.path : path.dirname(args.path));
  // Needed for relative imports to work when flattening
  files = files.map((file) => path.resolve(file));
  const {
    dedupeTaggedUnions,
    snakeToCamelCase,
    annotationNewLines,
    importStar,
  } = args;
  const config: MartokConfig = {
    files,
    package: args.package,
    sourceRoot: rootDir,
    options: {
      dedupeTaggedUnions,
      snakeToCamelCase,
      annotationNewLines,
      importStar,
    },
  };
  const martok = new Martok(config);
  await martok.writeKotlinFiles(path.resolve(args.out));
  console.log(`Finished`);
}

const { argv } = args.command(
  "$0 <path>",
  "Convert a file to kotlin",
  noop,
  transpile
);
