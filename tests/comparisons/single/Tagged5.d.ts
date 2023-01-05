export enum Types {
  Type1 = "type 1",
  Type2 = "type 2",
}

export type Tagged = {
  id: string;
  foo?: string;
} & (
    | {
      type: Types.Type1;
      state: State1;
    }
    | {
      type: Types.Type2;
      state: State2;
    }
  );

export type State1 = {
  foo: string;
  bar: number;
};

export type State2 = {
  foo: boolean;
  bar: string;
};
