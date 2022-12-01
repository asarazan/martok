export type Thing = Foo | Bar;

export type Base = {
  state: "first" | "second";
};

export type Foo = {
  type: "foo";
} & Base;

export type Bar = {
  type: "bar";
} & Base;
