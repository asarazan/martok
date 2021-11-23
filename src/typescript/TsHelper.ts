import _ from "lodash";
import * as path from "path";

export class TsHelper {
  public static getBaseFileName(file: string): string {
    return _(file.split(path.sep))
      .last()!
      .replace(".d.ts", "")
      .replace(".ts", "");
  }
}
