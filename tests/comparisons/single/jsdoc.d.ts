/**
 * Block Comment
 */
export type WithBlockComment = {
  /**
   * Testing with int.
   * @precision int
   */
  bar: number;

  /**
   * Testing
   */
  foo: string;

  /**
   * Testing with {@link Ref}
   */
  ref: Ref;
};

export type Ref = {
  foo: boolean;
};
