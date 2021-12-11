import { MartokOptions } from "./MartokOptions";

export type MartokConfig = {
  package: string;
  files: string[];
  sourceRoot: string;
  options?: MartokOptions;
};
