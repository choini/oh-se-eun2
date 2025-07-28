
export enum GameState {
  START = 'START',
  LOADING_MODEL = 'LOADING_MODEL',
  PREDICT = 'PREDICT',
  COMPARE = 'COMPARE',
  LEVEL_CLEAR = 'LEVEL_CLEAR',
  GAME_OVER = 'GAME_OVER',
}

export enum Gesture {
  Rock = 'Rock',
  Paper = 'Paper',
  Scissors = 'Scissors',
  Neutral = 'Neutral',
}

export interface Level {
  name: string;
  hint: string;
  pattern: number[];
  requiredGesture: Gesture;
}

export interface Prediction {
    className: string;
    probability: number;
}