import { glob } from "glob";
import * as util from "util";
import { Martok } from "../martok/Martok";
import * as path from "path";
import { title } from "../martok/NameGenerators";
import * as fs from "fs";
import * as assert from "assert";
import { sanitizeComparison } from "./sanitizeComparison";

const PACKAGE = "net.sarazan.martok";
const ROOT = "./comparisons";

describe("File Comparisons", () => {
  const types = glob.sync(`${ROOT}/**/*.d.ts`);
  for (const filename of types) {
    const compare = `${path.dirname(filename)}/${title(
      path.basename(filename, ".d.ts")
    )}.kt`;
    it(`${path.basename(filename)} : ${path.basename(compare)}`, async () => {
      const martok = new Martok({
        files: [filename],
        package: PACKAGE,
        sourceRoot: ROOT,
      });
      const out = sanitizeComparison(await martok.generateMultiFile());
      const contents = sanitizeComparison(
        await fs.promises.readFile(compare, "utf-8")
      );
      assert.equal(
        out,
        contents,
        `Contents did not match for ${filename} and ${compare}`
      );
    });
  }
});
