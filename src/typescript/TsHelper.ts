import { Program } from "typescript";
import _ from "lodash";
import * as path from "path";

export class TsHelper {
  private readonly checker = this.program.getTypeChecker();

  public constructor(private readonly program: Program) {}

  public static getBaseFileName(file: string): string {
    return _(file.split(path.sep))
      .last()!
      .replace(".d.ts", "")
      .replace(".ts", "");
  }
}
