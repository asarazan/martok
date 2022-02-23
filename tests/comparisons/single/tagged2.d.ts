export type HasId = { id: string };

export type IntersectionFirst = {
  id: string;
} & (
  | {
      type: "foo";
      foo: string;
    }
  | {
      type: "bar";
      bar: string;
    }
);

export type UnionFirst =
  | ({
      type: "foo";
      foo: string;
    } & HasId)
  | ({
      type: "bar";
      bar: string;
    } & HasId);
