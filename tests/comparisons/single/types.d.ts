export type FooLike = Foo;
export type StringLike = string;

export type Foo = {
  bar: string;
};

export type Bar = Foo & {
  baz: number;
};

export type Baz = Bar & {
  ban: boolean;
};

export type SomeArray = { foo: string }[];
