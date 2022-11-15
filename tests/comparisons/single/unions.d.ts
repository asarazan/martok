export type Unions = {
  foo: { bar: string } | { baz: string };
};

export type StringUnions = {
  foo: ("hey" | "hi")[];
};
