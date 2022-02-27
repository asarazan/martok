export type AnonList = {
  foo: {
    bar: string;
    baz: "one" | "two";
  }[];
};

export type NumberUnion = {
  foo: 1 | 2;
};

export type StringUnion = {
  foo: "barBar" | "bazBaz";
};

export type NumberStringUnion = {
  foo: "1.1" | "2";
};

export type Nested = {
  foo: {
    bar: string;
    baz: "one" | "two";
  };
};
