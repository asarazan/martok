/**
 * @expand
 */
export type WithOmit = Omit<Base, "bar">;
/**
 * @expand
 */
export type WithPick = Pick<Base, "bar" | "baz">;
/**
 * @expand
 */
export type WithPartial = Partial<Base>;
/**
 * @expand
 */
export type WithRequired = Required<Base>;

export type Base = {
  foo: string;
  bar: number;
  baz?: boolean;
};
