export type WithOmit = Omit<Base, "bar">;
export type WithPick = Pick<Base, "bar" | "baz">;
export type WithPartial = Partial<Base>;
// export type WithRequired = Required<Base>;

export type Base = {
  foo: string;
  bar: number;
  baz?: boolean;
};
