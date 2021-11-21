// I can't figure out how to get the interface system to spit out super-properties in a reasonable ourder...

export interface Foo {
  bar: string;
}

export interface Bar extends Foo {
  baz: number;
}

export interface Baz extends Bar {
  ban: boolean;
}
