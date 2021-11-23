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

export type SimplePoly =
  | {
      foo: string;
      bar: number;
    }
  | {
      foo: string;
      baz: boolean;
    };
