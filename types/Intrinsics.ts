export type HasAll = {
  str: string;
  strs: string[];
  num: number;
  nums: number[];
  bool: boolean;
  bools: boolean[];
  ref: Reference;
  refs: Reference[];
  json: any;
  jsons: any[];
};

export type Reference = {
  foo: string;
};

export type HasArray = {
  arr: string[];
};

export type HasString = {
  str: string[];
};
