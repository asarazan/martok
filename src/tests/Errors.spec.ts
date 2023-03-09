import { glob } from "glob";
import { Martok } from "../martok/Martok";
import * as path from "path";
import { title } from "../martok/NameGenerators";
import fs from "fs";

const PACKAGE = "net.sarazan.martok";
const ROOT = path.resolve("./tests/errors");

const ExpansionErrorStrings: Record<string, string> = {
  invalidComputed: `Type Computed is using computed types. Please add @expand to the type to expand it. If you wish to ignore this type, use @ignore.`,
  nestedComputed: `Type Computed is using computed types. Please add @expand to the type to expand it. If you wish to ignore this type, use @ignore.`,
};

describe("Type Expansion Errors", () => {
  const root = `${ROOT}/expand`;
  const types = glob.sync(`${root}/**/*.d.ts`);
  for (const filename of types) {
    it(`${path.basename(filename)}`, async () => {
      expect(() => {
        const martok = new Martok({
          files: [filename],
          package: PACKAGE,
          sourceRoot: root,
          options: {
            dedupeTaggedUnions: true,
            experimentalTypeExpanding: true,
          },
        });
        martok.generateOutput();
      }).toThrow(ExpansionErrorStrings[filename]);
    });
  }
});

describe("Import Errors", () => {
  const root = `${ROOT}/imports`;
  const types = glob.sync(`${root}/**/*.d.ts`);
  for (const filename of types) {
    it(`${path.basename(filename)}`, async () => {
      expect(() => {
        const martok = new Martok({
          files: [filename],
          package: PACKAGE,
          sourceRoot: root,
          options: {
            dedupeTaggedUnions: true,
            experimentalTypeExpanding: true,
          },
        });
        martok.generateOutput();
      }).toThrow();
    });
  }
});
