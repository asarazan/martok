export type Poly = {
  foo: string;
} & (
  | {
      // type: "something";
      bar: number;
    }
  | {
      // type: "else";
      baz: boolean;
    }
);
