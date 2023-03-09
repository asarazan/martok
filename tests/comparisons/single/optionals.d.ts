export type Foo = {
  foo?: string;
};

export type Bar = {
  optionalProp?: string | undefined;
};

export type Baz = {
  nullProp: boolean | null;
};

export type One = {
  foo: string;
};

export type Two = {
  bar: string;
};

export type Three = One | Two;
