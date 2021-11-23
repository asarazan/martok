import { glob } from "glob";
import { Martok } from "../martok/Martok";
import * as path from "path";
import { title } from "../martok/NameGenerators";
import * as fs from "fs";
import * as assert from "assert";
import { sanitizeComparison } from "./sanitizeComparison";
import _, { values } from "lodash";
import * as util from "util";

const PACKAGE = "net.sarazan.martok";
const ROOT = path.resolve("./tests/comparisons");

describe("Single File Comparisons", () => {
  const root = `${ROOT}/single`;
  const types = glob.sync(`${root}/**/*.d.ts`);
  for (const filename of types) {
    const compare = `${path.dirname(filename)}/${title(
      path.basename(filename, ".d.ts")
    )}.kt`;
    it(`${path.basename(filename)} : ${path.basename(compare)}`, async () => {
      const martok = new Martok({
        files: [filename],
        package: PACKAGE,
        sourceRoot: root,
      });
      const out = sanitizeComparison(martok.generateMultiFile());
      const contents = sanitizeComparison(
        await fs.promises.readFile(compare, "utf-8")
      );
      expect(out).toEqual(contents);
    });
  }
});

describe("Multi File Comparisons", () => {
  const root = `${ROOT}/multi`;
  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((value) => value.isDirectory())
    .map((value) => value.name);
  for (const dirname of dirs) {
    it(`${path.basename(dirname)}`, async () => {
      const dir = `${root}/${dirname}`;
      const files = await util.promisify(glob)(`${dir}/**/*.{ts,d.ts}`);
      const martok = new Martok({
        files: files,
        package: PACKAGE,
        sourceRoot: dir,
      });
      const out = _.mapValues(martok.generateSingleFiles(dir), (value) => {
        return sanitizeComparison(value);
      });
      for (const filename in out) {
        const contents = sanitizeComparison(
          await fs.promises.readFile(filename, "utf-8")
        );
        expect(out[filename]).toEqual(contents);
      }
    });
  }
});
