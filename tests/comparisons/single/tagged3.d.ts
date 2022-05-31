export type Empty = { type: "foo" } | { type: "bar" };

export type NestedLiteralUnion = {
  id: string;
  data:
    | {
        type: "foo";
        data: Foo;
      }
    | {
        type: "bar";
        data: Bar;
      };
};

export type Foo = {
  foo: string;
};

export type Bar = {
  bar: string;
};
