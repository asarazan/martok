import { Foo } from "./external";

/**
 * @ignore
 */
type Modify<T extends Record<string, { foo: string }>> = {
  [P in keyof T]: T[P]["foo"];
};

/**
 * @expand
 */
type Computed = Modify<Foo>;
