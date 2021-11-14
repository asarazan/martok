import { SourceFile, Type } from "typescript";

export type MartokType = {
  name: string;
  file?: SourceFile;
  isIntrinsic: boolean;
  rawType: Type;
};
