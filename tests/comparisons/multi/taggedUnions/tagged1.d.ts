export type Foo = Foo1 | Foo2;

export type FooType = "type1" | "type2";

export type Foo1 = {
  type: "type1";
  value: string;
};

export type Foo2 = {
  type: "type2";
  value: number;
};
