import { glob } from "glob";
import { Martok } from "../martok/Martok";
import * as path from "path";
import { title } from "../martok/NameGenerators";
import fs from "fs";

const PACKAGE = "net.sarazan.martok";
const ROOT = path.resolve("./tests/errors");

describe("Type Expansion Errors", () => {
  const root = `${ROOT}/expand`;
  const types = glob.sync(`${root}/**/*.d.ts`);
  for (const filename of types) {
    const errorCompare = `${path.dirname(filename)}/${title(
      path.basename(filename, ".d.ts")
    )}.txt`;
    it(`${path.basename(filename)}`, async () => {
      expect(() => {
        new Martok({
          files: [filename],
          package: PACKAGE,
          sourceRoot: root,
          options: {
            dedupeTaggedUnions: true,
            experimentalTypeExpanding: true,
          },
        });
      }).toThrow(fs.readFileSync(errorCompare, "utf-8"));
    });
  }
});
