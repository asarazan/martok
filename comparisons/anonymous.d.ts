export type StringUnion = {
  foo: "bar" | "baz";
};

export type Nested = {
  foo: {
    bar: string;
    baz: "one" | "two";
  };
};
