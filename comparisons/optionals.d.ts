export type Foo = {
  foo?: string;
};

export type One = {
  foo: string;
};

export type Two = {
  bar: string;
};

export type Three = One | Two;
