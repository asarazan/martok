import { kotlin } from "./Klass";
import Klass = kotlin.Klass;
import ConstructorParameter = kotlin.ConstructorParameter;
import Mutability = kotlin.Mutability;

export class KlassPrinter {
  public print(klass: Klass | string, indent = 0): string {
    if (typeof klass === "string") return klass;
    const result = [] as string[];

    // Annotation
    if (klass.annotation?.length) {
      this.indent(indent, result);
      result.push(klass.annotation);
      result.push("\n");
    }

    // Class declaration
    this.indent(indent, result);
    for (const mod of klass.modifiers) {
      result.push(`${mod} `);
    }
    result.push(`${klass.klassType}`);
    if (klass.name?.length) result.push(` ${klass.name}`);

    // Primary Constructor
    if (klass.ctor.length) {
      result.push("(");
      result.push("\n");
      indent++;
      this.push(
        result,
        klass.ctor.map((value) => this.printParameter(value)),
        indent,
        ",\n"
      );
      indent--;
      result.push("\n");
      this.indent(indent, result);
      result.push(")");
    }

    if (klass.extends) {
      result.push(` : ${klass.extends.name}`);
      result.push(
        `(${klass.extends?.args?.map((value) => value.name).join(", ") ?? ""})`
      );
    }

    if (klass.implements.length) {
      if (klass.extends) {
        result.push(", ");
      } else {
        result.push(" : ");
      }
      result.push(klass.implements.join(", "));
    }

    // Internal stuff
    if (
      klass.enumValues.length ||
      klass.members.length ||
      klass.internalClasses.length ||
      klass.statements.length
    ) {
      result.push(" {\n");
      indent++;
      if (klass.enumValues?.length) {
        this.push(
          result,
          klass.enumValues.map((value) => {
            const annotation = value.annotation ? `${value.annotation} ` : "";
            const args = value.args?.length
              ? `(${value.args.map((value1) => value1.name).join(", ")})`
              : "";
            return `${annotation}${value.name}${args}`;
          }),
          indent,
          ",\n"
        );
        result.push(";\n");
      }
      if (klass.members?.length) {
        this.push(
          result,
          klass.members.map((value) => this.printParameter(value, "val")),
          indent,
          "\n"
        );
        result.push("\n");
      }
      klass.internalClasses.forEach((value, index) => {
        result.push(this.print(value, indent));
        if (index < klass.internalClasses.length - 1) {
          result.push("\n\n");
        }
      });
      if (klass.statements.length) {
        this.push(result, klass.statements, indent, "\n");
        result.push("\n");
      }
      indent--;
      this.push(result, ["}"], indent);
    }
    result.push("\n");

    return result.join("");
  }

  private push(
    result: string[],
    statements: string[],
    indent: number,
    join = ","
  ) {
    statements.forEach((value, index) => {
      const lines = value.split("\n");
      lines.forEach((line, lineIndex) => {
        this.indent(indent, result);
        result.push(line);
        if (lines.length > 1 && lineIndex < lines.length - 1) {
          result.push("\n");
        }
      });
      if (index < statements.length - 1) result.push(join);
    });
  }

  private indent(count: number, result: string[]) {
    for (let i = 0; i < count; ++i) {
      // Two spaces...
      result.push(" ");
      result.push(" ");
    }
  }
  private printParameter(
    param: ConstructorParameter,
    defaultMutability?: Mutability
  ): string {
    const result = [];
    if (param.annotation?.length) {
      result.push(`${param.annotation}`);
      if (param.annotation.length > 32) {
        result.push("\n");
      } else {
        result.push(" ");
      }
    }
    if (param.abstract) {
      result.push(`abstract `);
    }
    if (param.visibility) {
      result.push(`${param.visibility} `);
    }
    if (param.mutability || defaultMutability) {
      result.push(`${param.mutability ?? defaultMutability} `);
    }
    result.push(`${param.name}: ${param.type}`);
    if (param.nullable) {
      result.push("?");
    }
    if (param.value) {
      result.push(` = ${param.value}`);
    }
    return result.join("");
  }
}
