import { CallSessionUpdate } from "../../CallSession";

export type CallSocketUpdate = {
  event: "call";
  data: CallSessionUpdate;
};
