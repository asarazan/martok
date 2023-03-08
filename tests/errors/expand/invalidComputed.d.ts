type T = {
  foo: string;
  bar: number;
};

// Should throw an error
type Computed = Omit<T, "bar">;
