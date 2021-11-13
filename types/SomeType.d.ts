import { UserContact } from "./users/UserContact";

export type OtherType = {
  contact: UserContact;
  hi: boolean;
  some: SomeType;
};

export type SomeType = {
  foo: string;
  bar?: number;
};
