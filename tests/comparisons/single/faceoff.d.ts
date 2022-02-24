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
export type SongQuizGameSession = {
  gameType: "foo";
  specificGameSessionState?: { foo: string };
} & BaseGameSession;

export type PictionaryGameSession = {
  gameType: "bar";
  specificGameSessionState?: { bar: string };
} & BaseGameSession;

export type BaseGameSession = {
  id: string;
  // gameType: GameType;
  // specificGameSessionState?: GameSessionState;
};

export type GameSession = SongQuizGameSession | PictionaryGameSession;
export type GameActionUpdate =
  | {
      gameType: "foo";
      data: { foo: string };
    }
  | {
      gameType: "pictionary";
      data: { bar: string };
    };
