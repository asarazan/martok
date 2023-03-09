import { VirtualTypeScriptEnvironment } from "@typescript/vfs";
import ts, { SourceFile, Statement, getJSDocTags } from "typescript";
import { hasTypeArguments } from "../../typescript/utils";
import { Martok } from "../Martok";
import { extractJsDocs, insertJsDocs, JsDocProperty } from "./Comments";

type ExpandResponse = {
  fs: Map<string, string>;
  program: ts.Program;
};

type ExpandFile = {
  fileName: string;
  fileString: string;
  docs: JsDocProperty[];
};

type ExpandStatementWithImports = {
  imports: string[];
  statement: string;
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

  private pullImports(type: string): ExpandStatementWithImports {
    const resolvedImports: ExpandStatementWithImports = {
      imports: [],
      statement: type,
    };
    const imports: Record<string, Set<string>> = {};

    // Import regex for statements like: import("path/to/file").Type
    const importRegex = /import\(["']([^\n ]*)["']\)/g;
    const importRegexWithType =
      /import\(["']([^\n ]*)["']\)\.([a-zA-Z_$][0-9a-zA-Z_$]*)/g;

    const matches = type.match(importRegexWithType);
    if (!matches) return resolvedImports;

    // Pull out all the imports and types, replace them with a placeholder type
    for (const match of matches) {
      const importStatement = match.match(importRegex)![0];
      const fileName = importStatement
        .replace(/import\(["']/g, "")
        .replace(/["']\)/g, "");
      const typeName = match.replace(importStatement, "").replace(".", "");

      if (!imports[fileName]) imports[fileName] = new Set();
      imports[fileName].add(typeName);

      // Replace the import statement with a placeholder type
      resolvedImports.statement.replace(match, typeName);
    }

    // Create the import statements
    for (const fileName in imports) {
      const types = Array.from(imports[fileName]).join(", ");
      resolvedImports.imports.push(`import { ${types} } from "${fileName}";`);
    }

    return resolvedImports;
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

    const newStatement = this.pullImports(newExpandedType);

    const s = [];
    for (const c of statement.getChildren()) {
      if (c.kind === ts.SyntaxKind.EqualsToken) break;
      s.push(c.getText());
    }
    s.push("=");

    const statements = [
      ...newStatement.imports,
      `${s.join(" ")} ${newStatement.statement};`,
    ];

    return statements.join("\n");
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

  public expand(): ts.Program {
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
    const program = this.martok.compiler.compileFiles(fs);

    // Insert collected docs back into the program
    fs.forEach((_value, fileName) => {
      const source = program.getSourceFile(fileName);
      if (!source) throw new Error(`Failed to get source file ${fileName}`);
      this.insertJsDocsToFile(source, docs.get(fileName)!);
    });

    return program;
  }
}
