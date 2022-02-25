import { GameSessionState } from "./GameSession";

export type SongQuizName = "songQuiz";

export type SongQuizEra = "60s" | "70s" | "80s" | "90s" | "2000s" | "2010s";

export type SongQuizSessionState = {
  songsInfo: SongInfo[];
  era: SongQuizEra;
  /// Only present during the game
  currentTrackInfo?: {
    indexOfCurrentTrack: number;
  }; /// Nil if session is completed
} & GameSessionState;

export type SongInfo = {
  songInfoId: string;
  artistName: string;
  songName: string;
  songUrl: string;
  acceptedArtistNames: string[];
  acceptedTitleNames: string[];
  delegatedUserId?: string;
  delegatedScore: number;
  guessInfo?: {
    artistCorrect: boolean;
    songCorrect: boolean;
    isAnswerFinal: boolean; /// Guess info can hold temporary state, this indicates if it's final
  };
};

export type SongQuizPlayer = {
  userId: string;
  indexesOfDelegatedTracks: number[];
};

/// Whenever something happens (Win / lose), this event is sent with the latest SQ session state. (This is not persisted in the DB, just communicated through sockets during session.)

export type SongQuizLifeCycleEvent = {
  eventType:
    | "roundEnded"
    | "partiallyGuessed"
    | "currentlyListening"
    | "gameStarted"
    | "gameEnded";
  // UID that is pertinent to event, only present in some
  /// (e.g. CorrectArtist for uid 1234, no pertinentUID for SessonDidStart)
  pertinentUserId?: string;
  sessionState: SongQuizSessionState;
};

export type SongQuizSpeechText = {
  userId: string;
  speechText: string;
};

type LifeCycleEventUpdate = {
  type: "lifecycleEvent";
  data: SongQuizLifeCycleEvent;
};

type SpeechTextEvent = {
  type: "speechText";
  data: SongQuizSpeechText;
};

type RepeatTrack = {
  type: "repeatTrack";
};

export type SongQuizUpdate =
  | LifeCycleEventUpdate
  | SpeechTextEvent
  | RepeatTrack;
