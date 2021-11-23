export type StringUnion = {
  foo: "barBar" | "bazBaz";
};

export type Nested = {
  foo: {
    bar: string;
    baz: "one" | "two";
  };
};
