export type Tagged = Tagged1 | Tagged2;

export type Tagged1 = {
  some_tag: "foo";
  some_value1: string;
};

export type Tagged2 = {
  some_tag: "bar";
  some_value2: string;
};

export type SnakeCase = {
  some_union: "foo_bar" | "foo_baz";
  some_var: string;
  stupid__var: boolean;
  some_ref: Ref;
};

export type Ref = {
  foo: string;
};
