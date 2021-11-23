export type StringUnion = {
  foo: "barBar" | "bazBaz";
};

export type Nested = {
  foo: {
    bar: string;
    baz: "one" | "two";
  };
};

export type SimplePoly =
  | {
      foo: string;
      bar: number;
    }
  | {
      foo: string;
      baz: boolean;
    };
