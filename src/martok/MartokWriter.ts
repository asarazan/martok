import { MartokOutput } from "../types/MartokOutput";
import { StandardKotlinImports } from "../kotlin/StandardKotlinImports";
import { MartokClass } from "../types/MartokClass";
import { MartokFile } from "../types/MartokFile";
import { MartokProperty } from "../types/MartokProperty";
import { MartokType } from "../types/MartokType";
import { IntrinsicType } from "../typescript/IntrinsicType";
import * as fs from "fs";
import { TypeReference } from "typescript";
import { TsHelper } from "../typescript/TsHelper";
import { Martok } from "./Martok";

export class MartokWriter {
  public constructor(private readonly martok: Martok) {}

  public writeToConsole(output: MartokOutput) {
    console.log(`${output.package}: Processed ${output.files.length} files...`);
    for (const file of output.files) {
      console.log(`File: ${file.name}`);
      console.log(this.formatFile(file));
      console.log("==================");
    }
  }

  public async writeToFileSystem(output: MartokOutput, path: string) {
    // is a root directory.
    if (!path.endsWith(".kt")) {
      throw Error("We don't support multi-file yet!");
    }
    // await fs.promises.mkdir(root, { recursive: true });
    const contents = `package ${output.package}

${StandardKotlinImports}

${output.files
  .map((file) => file.classes.map((cls) => this.formatClass(cls)).join("\n\n"))
  .join("\n\n")}
`;
    await fs.promises.writeFile(path, contents);
  }

  private formatFile(file: MartokFile): string {
    return `package ${file.package}

${StandardKotlinImports}

${file.classes.map((value) => this.formatClass(value)).join("\n\n")}
`;
  }

  private formatClass(cls: MartokClass): string {
    return `@Serializable
data class ${cls.name} (
${cls.properties.map((value) => `  ${this.formatProperty(value)}`).join("\n")}
) {
  // TODO custom serialization
}`;
  }

  private formatProperty(prop: MartokProperty): string {
    return `val ${prop.name}: ${this.fromType(prop.type)}${
      prop.optional ? "? = null" : ""
    }`;
  }

  private getArrayString(type: MartokType): string {
    const params = this.martok.checker.getTypeArguments(
      type.rawType as TypeReference
    );
    const t = params[0];
    const mtype = TsHelper.processType(t);
    if (!mtype) {
      return `List<JsonObject>`;
    }
    return `List<${this.fromType(mtype)}>`;
  }

  private fromType(type: MartokType): string {
    if (!type.isIntrinsic) {
      return type.name;
    } else {
      switch (type.name as IntrinsicType) {
        case "string":
          return "String";
        case "number":
          return "Double";
        case "boolean":
          return "Boolean";
        case "Array":
          return this.getArrayString(type);
        case "any":
          return "JsonObject";
        default:
          throw new Error(`Unsupported property type: ${type}`);
      }
    }
  }
}
