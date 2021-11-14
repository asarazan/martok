import * as ts from "typescript";
import { MartokOutput } from "../types/MartokOutput";
import {
  InterfaceDeclaration,
  isInterfaceDeclaration,
  isTypeAliasDeclaration,
  isUnionTypeNode,
  Type,
  TypeAliasDeclaration,
  TypeElement,
  TypeLiteralNode,
  UnionType,
} from "typescript";
import { MartokFile } from "../types/MartokFile";
import { MartokClass } from "../types/MartokClass";
import { MartokProperty } from "../types/MartokProperty";
import { TsHelper } from "../typescript/TsHelper";
import _ from "lodash";
import * as path from "path";

export type MartokConfig = {
  package: string;
  files: string[];
  output: string;
  sourceRoot: string;
};

export class Martok {
  private readonly program = ts.createProgram(this.config.files, {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
  public readonly checker = this.program.getTypeChecker();
  private readonly helper = new TsHelper(this.program);

  public constructor(private readonly config: MartokConfig) {}

  public async transpile(): Promise<MartokOutput> {
    return {
      package: this.config.package,
      files: this.config.files.map((value) => this.processFile(value)),
    };
  }

  private processFile(file: string): MartokFile {
    const source = this.program.getSourceFile(file)!;
    const classes = [];
    for (const statement of source.statements) {
      switch (statement.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.TypeAliasDeclaration:
          classes.push(
            this.processType(
              statement as InterfaceDeclaration | TypeAliasDeclaration
            )
          );
          break;
      }
    }
    const name = TsHelper.getBaseFileName(file);
    let relativePath = path.dirname(file);
    if (relativePath.startsWith(this.config.sourceRoot)) {
      relativePath = relativePath.slice(this.config.sourceRoot.length);
    }
    const pkg = `${this.config.package}${relativePath.replace("/", ".")}`;

    return {
      name,
      package: pkg,
      relativePath,
      classes,
    };
  }

  private processType(
    decl: InterfaceDeclaration | TypeAliasDeclaration
  ): MartokClass {
    let members: ReadonlyArray<TypeElement> = [];
    if (isInterfaceDeclaration(decl)) {
      members = decl.members;
    } else if (isTypeAliasDeclaration(decl)) {
      const type = this.checker.getTypeFromTypeNode(decl.type);
      if (type.isUnion()) {
        return this.processUnionType(type);
      }
      members = (decl.type as TypeLiteralNode).members;
    }
    if (!members) {
      throw new Error(`Cannot read declaration: ${decl.name.escapedText}`);
    }
    return {
      name: decl.name.escapedText!,
      properties: _(members.map((value) => this.processProperty(value)))
        .compact()
        .value(),
    };
  }

  private processUnionType(type: UnionType): MartokClass {
    for (const subtype of type.types) {
      if (!subtype.isStringLiteral()) {
        throw new Error("Only string unions currently supported");
      }
    }
  }

  private processProperty(prop: TypeElement): MartokProperty | undefined {
    return this.helper.propertyFromElement(prop);
  }
}
