export type FooBase = {};
export type Subfoo = { message: "sub foo" };

export type Base = {
  foo: FooBase;
};

export type Subclass = Base & {
  foo: Subfoo;
};
