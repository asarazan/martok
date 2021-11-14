import { MartokProperty } from "./MartokProperty";

// Technically this could be an enum or a literal union, but the end result will be the same.
export type MartokEnum<T extends number | string> = {
  name: string;
  values: T[];
};

export type MartokClass = {
  name: string;
  properties: MartokProperty[];
};
