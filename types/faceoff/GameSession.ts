import {
  PictionaryName,
  PictionarySessionState,
  PictionaryUpdate,
} from "./Pictionary";
import { SongQuizUpdate, SongQuizName, SongQuizSessionState } from "./SongQuiz";

export type GameType = SongQuizName | PictionaryName;

export type BaseGameSession = {
  id: string;
  callSessionId: string;
  principalUserId: string; /// User who starts the game
  gameState: "started" | "ended";
  startDateTime: string;
  endDateTime?: string;
};

export type SongQuizGameSession = {
  gameType: SongQuizName;
  specificGameSessionState?: SongQuizSessionState;
} & BaseGameSession;

export type PictionaryGameSession = {
  gameType: PictionaryName;
  specificGameSessionState?: PictionarySessionState;
} & BaseGameSession;

export type GameSession = SongQuizGameSession | PictionaryGameSession;

export type GameSessionState = {};

export type GameActionUpdate =
  | {
      gameType: SongQuizName;
      data: SongQuizUpdate;
    }
  | {
      gameType: PictionaryName;
      data: PictionaryUpdate;
    };
