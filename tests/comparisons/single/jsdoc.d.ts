/**
 * Block Comment
 */
export type WithBlockComment = {
  /**
   * Testing
   */
  foo: string;

  /**
   * Testing with int.
   * @precision int
   */
  bar: number;

  /**
   * Testing with {@link WithLineComment}
   */
  comment: WithLineComment;
};

// This is a line comment.
export type WithLineComment = {
  // So is this.
  foo: boolean;
};
