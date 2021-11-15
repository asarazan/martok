export type TBar = TFoo & {
  baz: boolean;
};

export type TFoo = {
  bar: string;
};

export interface Bar extends Foo {
  baz: boolean;
}

export interface Foo {
  bar: string;
}

export type Basic = {
  foo: string;
  bar?: number;
};

export type StringUnion = "bar" | "baz";

export type Reference = {
  basic?: Basic;
  union: StringUnion;
};
