import { UserContact } from "./users/UserContact";

export type OtherType = {
  contact: UserContact;
  hi: boolean;
  some: SomeType;
  boo: string[];
  other: SomeType[];
};

export type SomeType = {
  foo: string;
  bar?: number;
};
