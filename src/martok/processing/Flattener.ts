import { VirtualTypeScriptEnvironment } from "@typescript/vfs";
import ts, { SourceFile, Statement, Node } from "typescript";
import { hasTypeArguments } from "../../typescript/utils";
import { Martok } from "../Martok";
import { extractJsDocs, insertJsDocs, JsDocProperty } from "./Comments";

type FlattenedResponse = {
  fs: Map<string, string>;
  program: ts.Program;
  env: VirtualTypeScriptEnvironment;
};

type FlatFile = {
  fileName: string;
  fileString: string;
  docs: JsDocProperty[];
};

export class Flattener {
  public constructor(private martok: Martok) {}

  /**
   * Finds the first instance of an indentifier within a statement and returns it's node
   * (e.x. "export type Foo = string" will return the node for "Foo")
   * @param statement The statement to search
   * @returns The node for the identifier or undefined if none was found
   */
  private getStatementIdentifier(statement: Statement): Node | undefined {
    const children = statement.getChildren();
    const typeKeywordIndex = children.findIndex((c) => {
      return c.kind === ts.SyntaxKind.TypeKeyword;
    });
    if (typeKeywordIndex > -1) {
      const node = children[typeKeywordIndex + 1];
      if (node.kind === ts.SyntaxKind.Identifier) {
        const val = children[typeKeywordIndex + 3];
        const end = children[typeKeywordIndex + 4];

        const hasGenericArguments = hasTypeArguments(val);

        const isTerminating = !end || end.kind === ts.SyntaxKind.SemicolonToken;

        // We want to ingore quickInfo for cases where we are simply creating a type alias
        // ex. "export type Foo = Bar;" --> in this case we don't want to flatten "Bar"
        if (
          ts.isTypeReferenceNode(val) &&
          !hasGenericArguments &&
          isTerminating
        )
          return undefined;

        return node;
      }
    }
  }

  /**
   * Takes in a statement and runs `quickInfo` on it. Quick info will compute any computed
   * types and returns a string representing the flattened type. This string is expected to
   * be recompiled later.
   * @param statement The statement of the type we want to faltten
   * @returns A string representing the flattened type
   */
  private getFlattenedType(statement: Statement): string {
    const identifier = this.getStatementIdentifier(statement);
    if (!identifier) return statement.getFullText();

    const fileName = identifier.getSourceFile().fileName;
    const quickInfo = this.martok.env.languageService.getQuickInfoAtPosition(
      fileName,
      identifier.getStart()
    );

    if (!quickInfo || !quickInfo.displayParts) return statement.getFullText();

    // Piece together the flattened type
    const newFlattenedType = quickInfo.displayParts.map((p) => p.text).join("");

    if (statement.getText().substring(0, 6) === "export")
      return `export ${newFlattenedType};`;

    return newFlattenedType;
  }

  private insertJsDocsToFile(file: SourceFile, docs: JsDocProperty[]) {
    file.statements.flatMap((s) => {
      insertJsDocs(this.martok, s, docs);
    });
  }

  private getFlatFile(file: SourceFile): FlatFile {
    const flatFile: FlatFile = {
      fileName: file.fileName,
      fileString: "",
      docs: [],
    };
    file.statements.flatMap((s) => {
      const flatText = this.getFlattenedType(s);
      flatFile.docs.push(...extractJsDocs(this.martok, s));
      flatFile.fileString += flatText.trim() + "\n";
    });
    return flatFile;
  }

  public flattenFileSystem(): FlattenedResponse {
    const fs = new Map<string, string>();
    const docs = new Map<string, JsDocProperty[]>();

    // Replace with flattened types, collect docs
    this.martok.config.files.forEach((fileName) => {
      const source = this.martok.program.getSourceFile(fileName);
      if (!source) throw new Error(`Failed to get source file ${fileName}`);
      const flatFile = this.getFlatFile(source);
      fs.set(flatFile.fileName, flatFile.fileString);
      docs.set(flatFile.fileName, flatFile.docs);
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
