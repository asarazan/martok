/**
 * This is a comment2
 */
type MyType = {
  prop1: {
    foo: "bar";
    boz: "baz";
  };
  /**
   * This is a comment
   * poggings
   */
  prop2: {
    foo: "bar2";
  };
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
export type Computed = Modify<MyType>;

/**
 * @ignore
 */
type Modify2<T extends Record<string, { foo: string }>> = {
  [P in keyof T]: T[P];
};

/**
 * @expand
 */
export type Computed2 = Modify2<MyType>;
