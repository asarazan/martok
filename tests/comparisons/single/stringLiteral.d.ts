export type Type1 = "type 1";
export type Type2 = "type 2";
export type Types = Type1 | Type2;

export type Tagged = {
  id: string;
  type1: Type1;
  type2: Type2;
  types: Types;
};
