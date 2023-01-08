import { Ref1 } from "./ref1";
import { Ref3 } from "./sub/ref3";

export type Ref2 = {
  ref1: Ref1;
  ref3: Ref3;
};
