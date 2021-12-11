export type Foo1 = {
  foo: string;
};

export type Foo2 = {
  foo: number;
};

export type Foo = Foo1 | Foo2;
