export enum MyEnum {
  Type1 = "type 1",
  Type2 = "type 2",
}

export type Tagged = {
  id: string;
  foo?: string;
} & (
  | {
      type: MyEnum.Type1;
      state: string;
    }
  | {
      type: MyEnum.Type2;
      state: number;
    }
);
