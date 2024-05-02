import ts, {
  isCallExpression,
  isIdentifier,
  isPropertyAccessExpression,
  isVariableStatement,
  SourceFile,
  SyntaxKind,
} from "typescript";
import { Martok } from "../../Martok";
import { MartokZodObject } from "./MartokZodObject";
import _ from "lodash";

export class ZodProcessor {
  public constructor(private readonly martok: Martok) {}

  public allowImportThrough(file: ts.SourceFile): boolean {
    if (!this.martok.config.options?.experimentalZodSupport) return false;
    return file.fileName.includes("/martok/node_modules/zod/lib/");
  }

  private zodObjects(file: ts.SourceFile): MartokZodObject[] {
    const result: MartokZodObject[] = [];
    for (const statement of file.statements) {
      if (!isVariableStatement(statement)) continue;
      const decl = statement.declarationList.declarations[0];
      const initializer = decl.initializer;
      if (!initializer) continue;
      if (!isCallExpression(initializer)) continue;
      const expression = initializer.expression;
      if (!isPropertyAccessExpression(expression)) continue;
      if (expression.expression.getText() !== "z") continue;
      if (expression.name.getText() !== "object") continue;
      const { pos, end } = statement;
      const isExport = _.some(
        statement.modifiers,
        (value) => value.kind == SyntaxKind.ExportKeyword
      );
      const identifier = decl.name.getText();
      const fullText = statement.getFullText();
      result.push({
        identifier,
        isExport,
        pos,
        end,
        fullText,
      });
    }
    return result;
  }

  private stringReplace(zod: MartokZodObject): string {
    const fullText = zod.fullText;
    const renamed = fullText.replace(zod.identifier, `__${zod.identifier}`);
    return `${renamed}
/** 
 * @expand 
 **/ 
export ${zod.identifier} = z.infer<typeof __${zod.identifier}>`;
  }

  private getText(file: SourceFile): string {
    const zods = this.zodObjects(file);
    if (!zods.length) return file.getFullText();
    let fullText = file.getFullText();
    for (const obj of _.reverse(zods)) {
      fullText = fullText.replace(obj.fullText, this.stringReplace(obj));
    }
    console.log(fullText);
    return fullText;
  }

  public modifyProgram(): ts.Program {
    const fs = new Map<string, string>();
    for (const fileName of this.martok.config.files) {
      const sourceFile = this.martok.program.getSourceFile(fileName)!;
      fs.set(fileName, this.getText(sourceFile));
    }
    return this.martok.compiler.compileFiles(fs);
  }
}
