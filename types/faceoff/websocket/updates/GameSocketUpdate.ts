import { GameActionUpdate, GameSession } from "../../GameSession";

export type GameSocketUpdate = {
  event: "game";
  data:
    | {
        type: "gameSessionUpdate";
        data: GameSession;
      }
    | {
        type: "gameActionUpdate";
        data: GameActionUpdate;
      };
};

export type GameSocketUpdateType = "gameSessionUpdate" | "gameActionUpdate";
