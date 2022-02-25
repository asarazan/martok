import { GameSessionState } from "./GameSession";
import { DrawData } from "./websocket/events/PictionaryEvents";

export type PictionaryName = "pictionary";

export type PictionarySessionState = {
  drawRounds: DrawRound[];
  currentRoundIndex: number;
} & GameSessionState;

export type DrawRound = {
  drawerInfo: PictionaryPlayer;
  answer: string; //e.g. Kitchen
  isCompleted: boolean;
  endRoundTime?: number;
  winnerInfo?: PictionaryPlayer;
};

export type PictionaryPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type PictionaryLifeCycleEvent = {
  eventType:
    | "drawRoundStarted"
    | "drawRoundEnded"
    | "pictionarySessionDidComplete";
  sessionState: PictionarySessionState;
};

export type PictionaryDrawingDataAction = DrawData;

export type PictionaryUndoStrokeAction = {
  strokeId: string;
};

export type PictionarySpeechTextResponse = {
  userId: string;
  speechText: string;
};

export type PictionaryUpdate =
  | {
      actionType: "lifecycleEvent";
      data: PictionaryLifeCycleEvent;
    }
  | {
      actionType: "drawingData";
      data: PictionaryDrawingDataAction;
    }
  | {
      actionType: "speechText";
      data: PictionarySpeechTextResponse;
    }
  | {
      actionType: "undoStroke";
      data: PictionaryUndoStrokeAction;
    };
