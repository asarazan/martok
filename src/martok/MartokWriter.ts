import { MartokOutput } from "../types/MartokOutput";
import { StandardKotlinImports } from "../kotlin/StandardKotlinImports";
import { MartokClass } from "../types/MartokClass";
import { MartokFile } from "../types/MartokFile";
import { MartokProperty } from "../types/MartokProperty";
import { MartokType } from "../types/MartokType";
import { PrimitiveType } from "../typescript/PrimitiveType";

export class MartokWriter {
  public writeToConsole(output: MartokOutput) {
    console.log(`${output.package}: Processed ${output.files.length} files...`);
    for (const file of output.files) {
      console.log(`File: ${file.name}`);
      console.log(this.formatFile(file));
      console.log("==================");
    }
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

  private fromType(type: MartokType): string {
    if (type.file) {
      // this means it's not a primitive.
      return type.name;
    } else {
      switch (type.name as PrimitiveType) {
        case "string":
          return "String";
        case "number":
          return "Double";
        case "boolean":
          return "Boolean";
        case "any":
          return "JsonObject";
        default:
          throw new Error(`Unsupported property type: ${type}`);
      }
    }
  }
}
