export type Empty = { type: "foo" } | { type: "bar" };

export type NestedLiteralUnion = {
  id: string;
  data:
    | {
        some_type: "foo";
        data: Foo;
      }
    | {
        some_type: "bar";
        data: Bar;
      };
};

export type Foo = {
  foo: string;
};

export type Bar = {
  bar: string;
};
