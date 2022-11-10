export type SnakeCase = {
  some_union: "foo_bar" | "foo_baz";
  some_var: string;
  stupid__var: boolean;
  some_ref: Ref;
};

export type Ref = {
  foo: string;
};
