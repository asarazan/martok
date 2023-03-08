import { VirtualTypeScriptEnvironment } from "@typescript/vfs";
import ts, { SourceFile, Statement, getJSDocTags } from "typescript";
import { hasTypeArguments } from "../../typescript/utils";
import { Martok } from "../Martok";
import { extractJsDocs, insertJsDocs, JsDocProperty } from "./Comments";

type ExpandResponse = {
  fs: Map<string, string>;
  program: ts.Program;
  env: VirtualTypeScriptEnvironment;
};

type ExpandFile = {
  fileName: string;
  fileString: string;
  docs: JsDocProperty[];
};

export class TypeExpander {
  public constructor(private martok: Martok) {}

  private shouldIgnore(node: ts.Node): boolean {
    return (
      getJSDocTags(node).find((value) => {
        return value.tagName.text.toLowerCase() === "ignore";
      }) !== undefined
    );
  }

  private shouldExpand(node: ts.Node): boolean {
    if (!ts.isTypeAliasDeclaration(node)) return false;

    const hasFlattenTag =
      getJSDocTags(node).find((value) => {
        return value.tagName.text.toLowerCase() === "expand";
      }) !== undefined;

    // Check AST recursively to see if type is using some computed type with typeArguments
    const checkGenericsRecursively = (node: ts.Node): boolean => {
      if (hasTypeArguments(node)) {
        return true;
      }

      for (const child of node.getChildren()) {
        if (checkGenericsRecursively(child)) return true;
      }

      return false;
    };

    if (!hasFlattenTag && checkGenericsRecursively(node)) {
      //If computed type or has computed type, throw an error because we are forced to expand
      throw new Error(
        `Type ${node.name.getText()} is using computed types. Please add @expand to the type to expand it. If you wish to ignore this type, use @ignore.`
      );
    }

    return hasFlattenTag;
  }

  /**
   * Takes in a statement and runs typeToString on it. This will compute any complex
   * types and returns a string representing the expended type. This string is expected to
   * be recompiled later.
   * @param statement The statement of the type we want to expand
   * @returns A string representing the expanded type
   */
  private getExpandedType(statement: Statement): string {
    if (this.shouldIgnore(statement)) return "";
    if (!this.shouldExpand(statement)) return statement.getFullText();

    const newExpandedType = this.martok.checker.typeToString(
      this.martok.checker.getTypeAtLocation(statement),
      statement,
      ts.TypeFormatFlags.InTypeAlias |
        ts.TypeFormatFlags.NoTypeReduction |
        ts.TypeFormatFlags.NoTruncation
    );

    const s = [];
    for (const c of statement.getChildren()) {
      if (c.kind === ts.SyntaxKind.EqualsToken) break;
      s.push(c.getText());
    }
    s.push("=");

    return `${s.join(" ")} ${newExpandedType};`;
  }

  private insertJsDocsToFile(file: SourceFile, docs: JsDocProperty[]) {
    file.statements.flatMap((s) => {
      insertJsDocs(this.martok, s, docs);
    });
  }

  private getExpandedFile(file: SourceFile): ExpandFile {
    const expandedFile: ExpandFile = {
      fileName: file.fileName,
      fileString: "",
      docs: [],
    };
    file.statements.flatMap((s) => {
      const flatText = this.getExpandedType(s);
      expandedFile.docs.push(...extractJsDocs(this.martok, s));
      expandedFile.fileString += flatText.trim() + "\n";
    });
    return expandedFile;
  }

  public expand(): ExpandResponse {
    const fs = new Map<string, string>();
    const docs = new Map<string, JsDocProperty[]>();

    // Replace with flattened types, collect docs
    this.martok.config.files.forEach((fileName) => {
      const source = this.martok.program.getSourceFile(fileName);
      if (!source) throw new Error(`Failed to get source file ${fileName}`);
      const expandedFile = this.getExpandedFile(source);
      fs.set(expandedFile.fileName, expandedFile.fileString);
      docs.set(expandedFile.fileName, expandedFile.docs);
    });

    // Recompile with flattened types
    const { program, env } = this.martok.compileFiles(fs);

    // Insert collected docs back into the program
    fs.forEach((_value, fileName) => {
      const source = program.getSourceFile(fileName);
      if (!source) throw new Error(`Failed to get source file ${fileName}`);
      this.insertJsDocsToFile(source, docs.get(fileName)!);
    });

    return {
      fs,
      program,
      env,
    };
  }
}
