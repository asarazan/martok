import { CallSocketUpdate } from "./CallSocketUpdate";
import { GameSocketUpdate } from "./GameSocketUpdate";

export type SocketUpdate = CallSocketUpdate | GameSocketUpdate;

export type SocketUpdateEvent =
  | "call"
  | "game"
  | "onboarding"
  | "starTransaction";
