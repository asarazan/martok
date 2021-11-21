export type Foo = {
  bar: string;
};

export type Bar = Foo & {
  baz: number;
};

export type Baz = Bar & {
  ban: boolean;
};
