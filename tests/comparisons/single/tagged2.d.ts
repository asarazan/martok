export type SongQuizName = "songQuiz";
export type PictionaryName = "pictionary";

export type GameType = SongQuizName | PictionaryName;
// eslint-disable-next-line @typescript-eslint/ban-types
export type GameSessionState = {};

export type BaseGameSession = {
  id: string;
  callSessionId: string;
  principalUserId: string; /// User who starts the game
  gameState: "started" | "ended";
  startDateTime: string;
  endDateTime?: string;
  gameType: GameType;
  specificGameSessionState?: GameSessionState;
};

export type PictionarySessionState = {
  foo2: "Pictionary";
} & GameSessionState;

export type SongQuizSessionState = {
  foo1: "Song Quiz";
} & GameSessionState;

export type SongQuizGameSession = {
  gameType: SongQuizName;
  specificGameSessionState?: SongQuizSessionState;
} & BaseGameSession;

export type PictionaryGameSession = {
  gameType: PictionaryName;
  specificGameSessionState?: PictionarySessionState;
} & BaseGameSession;
