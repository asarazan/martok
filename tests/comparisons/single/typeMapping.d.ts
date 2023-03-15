export type Foo = {
  bar: string;
};

export type Bar = {
  baz: {
    bar: string;
  };
};

export type Bar1 = {
  prop2: Foo;
};

/**
 * @ignore
 */
type Modify<T extends Record<string, { foo: string }>> = {
  [P in keyof T]: T[P]["foo"];
};

/**
 * @expand
 */
export type Baz = Modify<{
  prop: {
    foo: {
      bar: string;
    };
  };
}>;
