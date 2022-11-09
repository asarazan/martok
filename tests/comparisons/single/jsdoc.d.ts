/**
 * Block Comment
 */
export type WithBlockComment = {
  /**
   * Testing.
   */
  foo: string;

  /**
   * Testing with int.
   * @precision int
   */
  bar: number;

  /**
   * Testing with {@link Ref}
   */
  ref: Ref;
};

export type Ref = {
  foo: boolean;
};
