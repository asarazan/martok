export type Foo = {
  bar: string;
  baz: number;
};

export interface Reference1 {
  baz?: boolean;
  ref: Reference2;
}

export interface Reference2 {
  bab: boolean;
}
