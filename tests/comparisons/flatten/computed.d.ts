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

type Modify<T extends Record<string, { foo: string }>> = {
  [P in keyof T]: T[P]["foo"];
};

// Should not carry comment over as the propterty's value is different
export type Computed = Modify<MyType>;

type Modify2<T extends Record<string, { foo: string }>> = {
  [P in keyof T]: T[P];
};

// Should carry comment over
export type Computed2 = Modify2<MyType>;
