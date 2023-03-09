type MyType1 = {
  propA: {
    deep: MyType2 | MyType3 | MyType4;
  };
};

type MyType2 = {
  propB: {
    deep: MyType3 | MyType4;
  };
};

type MyType3 = {
  propC: {
    deep: MyType4;
  };
};

type MyType4 = {
  propD: {
    /**
     * Deep comment
     */
    deep: string;
  };
};

type MyType5 = (MyType1 | MyType2 | MyType3 | MyType4) & {
  propE: {
    deep: MyType4;
  };
};

/**
 * @ignore
 */
type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

/**
 * @expand
 */
export type Computed = ExpandRecursively<MyType5>;
