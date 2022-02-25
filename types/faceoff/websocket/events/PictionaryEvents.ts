export type PictionaryData =
  | PictionarySpeechText
  | PictionaryDrawingData
  | PictionaryUndoStroke;

export type PictionarySpeechText = {
  pictionaryActionType: "speechText";
  data: {
    speechText: string;
  } & BaseConfig;
};

export type PictionaryDrawingData = {
  pictionaryActionType: "drawingData";
  data: {
    drawData: DrawData;
  } & BaseConfig;
};

export type PictionaryUndoStroke = {
  pictionaryActionType: "undoStroke";
  data: {
    strokeId: string;
  } & BaseConfig;
};

export type BaseConfig = {
  drawRoundIndex: number;
  gameSessionId: string;
};

export type DrawData = {
  id: string;
  color: string;
  lineWidth: number;
  normalizedPoints: Point[];
};

export type Point = {
  x: number;
  y: number;
};
