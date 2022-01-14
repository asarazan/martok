import { kotlin } from "./Klass";
import Klass = kotlin.Klass;
import ConstructorParameter = kotlin.ConstructorParameter;
import Mutability = kotlin.Mutability;

export class KlassPrinter {
  public print(klass: Klass, indent = 0): string {
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
    result.push(`class ${klass.name}`);

    // Primary Constructor
    if (klass.ctor.length) {
      result.push("(\n");
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

    // Internal stuff
    if (
      klass.members.length ||
      klass.internalClasses.length ||
      klass.statements.length
    ) {
      result.push(" {\n");
      indent++;
      if (klass.members?.length) {
        this.push(
          result,
          klass.members.map((value) => this.printParameter(value)),
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
      this.push(result, klass.statements, indent, "\n\n");
      indent--;
      result.push("\n}");
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
      this.indent(indent, result);
      result.push(value);
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
    return result.join("");
  }
}
