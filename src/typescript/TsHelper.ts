import ts, {
  __String,
  Identifier,
  Program,
  PropertySignature,
  Type,
  TypeChecker,
  TypeElement,
} from "typescript";
import { MartokProperty } from "../types/MartokProperty";
import _ from "lodash";
import { MartokType } from "../types/MartokType";
import * as path from "path";
import { check } from "yargs";

// eslint-disable-next-line @typescript-eslint/no-namespace
export class TsHelper {
  private readonly checker = this.program.getTypeChecker();

  public constructor(private readonly program: Program) {}

  public static getBaseFileName(file: string): string {
    return _(file.split(path.sep))
      .last()!
      .replace(".d.ts", "")
      .replace(".ts", "");
  }

  public propertyFromElement(value: TypeElement): MartokProperty | undefined {
    const name = this.getPropertyName(value);
    const type = this.getPropertyType(value);
    const optional = this.isPropertyOptional(value);
    if (!name || !type) return undefined;
    return {
      name,
      type,
      optional,
    };
  }

  private getPropertyName(value: TypeElement): __String | undefined {
    return (value.name as Identifier).escapedText;
  }

  public getPropertyType(value: TypeElement): MartokType | undefined {
    const ttype = this.checker.getTypeAtLocation(value);
    return TsHelper.processType(ttype);
  }

  public static processType(type: Type): MartokType | undefined {
    const files = type
      .getSymbol()
      ?.getDeclarations()
      ?.map((value1) => value1.getSourceFile());
    // This is disgusting.
    const name =
      (type.aliasSymbol ?? type.getSymbol())?.escapedName ??
      (type as any).intrinsicName;
    const file = _.first(files);
    return {
      name,
      file,
      isIntrinsic: !file || name === "Array",
      rawType: type,
    };
  }

  private isPropertyOptional(value: TypeElement): boolean {
    return !!value.questionToken;
  }
}
