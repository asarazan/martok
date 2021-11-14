export type StringUnion = "foo" | "bar" | "baz";

export type Union1 = {
  foo: string;
  bar: number;
};

export type Union2 = {
  foo: number;
  bar2: boolean;
};

export type ComplexUnion = Union1 | Union2;
