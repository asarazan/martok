import { MartokClass } from "./MartokClass";

export type MartokFile = {
  name: string;
  package: string;
  classes: MartokClass[];
};
