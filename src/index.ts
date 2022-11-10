#!/usr/bin/env node

import yargs from "yargs";
import { noop } from "lodash";
import { glob } from "glob";
import util from "util";
import * as fs from "fs";
import * as path from "path";
import { MartokConfig } from "./martok/MartokConfig";
import { Martok } from "./martok/Martok";
import { MartokOptions } from "./martok/MartokOptions";
import { StandardDatePattern } from "./typescript/Patterns";

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
  .option("datePattern", {
    alias: "d",
    type: "string",
    describe:
      "regexp for any field that should be a date (requires kotlinx.datetime, use 'standard' for sensible default')",
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
};

async function transpile(args: TranspileSingleArgs) {
  console.log(`Transpile: `, args);
  const getFiles = util.promisify(glob);
  const isDir = (await fs.promises.lstat(args.path)).isDirectory();
  const files = isDir
    ? await getFiles(`${args.path}/**/*.{ts,d.ts}`)
    : [args.path];
  const rootDir = path.resolve(isDir ? args.path : path.dirname(args.path));
  let dates: MartokOptions["dates"] | undefined;
  if (args.datePattern?.length) {
    dates = {
      framework: "kotlinx.datetime",
      namePattern:
        args.datePattern === "standard"
          ? StandardDatePattern
          : RegExp(args.datePattern),
    };
  }
  const { dedupeTaggedUnions, snakeToCamelCase } = args;
  const config: MartokConfig = {
    files,
    package: args.package,
    sourceRoot: rootDir,
    options: {
      dates,
      dedupeTaggedUnions,
      snakeToCamelCase,
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
