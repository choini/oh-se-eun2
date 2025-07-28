
import { Level, GameState, Gesture } from './types';

export const COLUMNS = 20;
export const LAYERS = 6;
export const COMPARE_DURATION = 3000; // 3 seconds

export const LAYER_II_III = 1; // Prediction Error / Success Layer
export const LAYER_IV = 3;     // "Stimulus" Layer (shows correct pattern)
export const LAYER_V_VI = 5;   // Inactive in this version

// --- Gesture Patterns ---
const ROCK_PATTERN = [8, 9, 10, 11];
const PAPER_PATTERN = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const SCISSORS_PATTERN = [5, 6, 13, 14]; // V-shape

export const GESTURE_PATTERNS: Record<Gesture, number[]> = {
    [Gesture.Rock]: ROCK_PATTERN,
    [Gesture.Paper]: PAPER_PATTERN,
    [Gesture.Scissors]: SCISSORS_PATTERN,
    [Gesture.Neutral]: [],
}

export const LEVELS: Level[] = [
    {
        'name': 'Round 1: The Rock',
        'hint': "Show me a 'Rock'",
        'pattern': ROCK_PATTERN,
        'requiredGesture': Gesture.Rock,
    },
    {
        'name': 'Round 2: The Paper',
        'hint': "Show me 'Paper'",
        'pattern': PAPER_PATTERN,
        'requiredGesture': Gesture.Paper,
    },
    {
        'name': 'Round 3: The Scissors',
        'hint': "Show me 'Scissors'",
        'pattern': SCISSORS_PATTERN,
        'requiredGesture': Gesture.Scissors,
    },
    {
        'name': 'Round 4: Rock Again',
        'hint': "A solid 'Rock' is needed.",
        'pattern': ROCK_PATTERN,
        'requiredGesture': Gesture.Rock,
    },
    {
        'name': 'Round 5: Final Challenge - Paper',
        'hint': "Cover it all with 'Paper'",
        'pattern': PAPER_PATTERN,
        'requiredGesture': Gesture.Paper,
    }
];

export const GAME_STATE_MESSAGES: Record<GameState, { title: string, subtitle?: string }> = {
    [GameState.START]: { title: "Welcome to the AI Gesture Challenge!", subtitle: "Press [ENTER] to Begin" },
    [GameState.LOADING_MODEL]: { title: "Loading AI Model & Webcam...", subtitle: "Please wait a moment." },
    [GameState.PREDICT]: { title: "Show Your Hand to the Camera", subtitle: "The AI will lock in your choice automatically." },
    [GameState.COMPARE]: { title: "Comparing Results..." },
    [GameState.LEVEL_CLEAR]: { title: "Round Clear!", subtitle: "Press [ENTER] for the Next Challenge" },
    [GameState.GAME_OVER]: { title: "All Challenges Complete!", subtitle: "Press [ESC] to play again." }
};
