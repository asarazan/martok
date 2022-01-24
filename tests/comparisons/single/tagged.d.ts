export type Tagged = {
  id: string;
  foo?: string;
} & (
  | {
      type: "type1";
      state: State1;
    }
  | {
      type: "type2";
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
