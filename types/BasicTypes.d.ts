export type Basic = {
  foo: string;
  bar?: number;
};

export type StringUnion = "bar" | "baz";

export type Reference = {
  basic?: Basic;
  union: StringUnion;
};
