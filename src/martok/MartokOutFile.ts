import { kotlin } from "../kotlin/Klass";
import Klass = kotlin.Klass;
import ts from "typescript";

export type MartokOutFile = {
  name: string;
  pkg: string;
  file: ts.SourceFile;
  text: {
    package: string;
    imports: (string | null)[];
    declarations: (Klass | string)[];
  };
};
