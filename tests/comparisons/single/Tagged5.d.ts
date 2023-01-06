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
      state: string;
    }
  | {
      type: Types.Type2;
      state: number;
    }
);
