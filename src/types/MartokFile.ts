import { MartokClass } from "./MartokClass";

export type MartokFile = {
  name: string;
  package: string;
  relativePath: string;
  classes: MartokClass[];
};
