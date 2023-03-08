type T = {
  foo: string;
  bar: number;
};

// Should throw an error
type Computed = {
  prop: string;
} & Omit<T, "bar">;
