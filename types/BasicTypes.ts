export type HasArray = {
  arr: string[];
};

export interface AdminInvite {
  foo: Complex1 & { id: string };
}

export type Complex1 = {
  bar: number;
};

export type StringUnion = "bar" | "baz";

export type AnonUnion =
  | {
      foo: string;
    }
  | {
      bar: string;
    };

export type Reference = {
  union: StringUnion;
  basic?: Basic;
};

export type Big = {
  str: "foo" | "bar";
  small: {
    bar: boolean;
  };
  foo: string;
};

export type Complex2 = {
  baz: string;
};

// export type TBar = TFoo & {
//   baz: boolean;
// };

export type TFoo = {
  bar: string;
};

export interface Bar extends Foo {
  baz: boolean;
}

export interface Foo {
  bar: string;
}

export type Basic = {
  foo: string;
  bar?: number;
};
