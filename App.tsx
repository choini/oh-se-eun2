
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Level, Prediction } from './types';
import { GameState, Gesture } from './types';
import { LEVELS, COLUMNS, COMPARE_DURATION, GAME_STATE_MESSAGES, GESTURE_PATTERNS } from './constants';
import GameGrid from './components/GameGrid';
import HUD from './components/HUD';
import WebcamView from './components/WebcamView';

// @ts-ignore
const tmImage = window.tmImage;

// ======================================================================================
// Using the local model provided by the user.
// The files (model.json, metadata.json, weights.bin) should be in the public/model/ directory.
const MODEL_URL = "/model/";
// ======================================================================================

const KOREAN_TO_GESTURE: { [key: string]: Gesture } = {
    "주먹": Gesture.Rock,
    "가위": Gesture.Scissors,
    "보": Gesture.Paper,
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.START);
    const [currentLevel, setCurrentLevel] = useState<number>(0);
    const [totalScore, setTotalScore] = useState<number>(0);
    const [levelScore, setLevelScore] = useState<number>(0);

    const [errorGrid, setErrorGrid] = useState<number[]>(() => Array(COLUMNS).fill(0));
    const [successGrid, setSuccessGrid] = useState<number[]>(() => Array(COLUMNS).fill(0));

    const [model, setModel] = useState<any | null>(null);
    const [webcam, setWebcam] = useState<any | null>(null);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
    const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
    
    const webcamRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();

    // Effect to check if the Teachable Machine library is loaded
    useEffect(() => {
        const interval = setInterval(() => {
            // @ts-ignore
            if (window.tmImage) {
                setIsLibraryLoaded(true);
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const initTeachableMachine = useCallback(async () => {
        if (!webcamRef.current) return;
        setGameState(GameState.LOADING_MODEL);
        setIsModelLoading(true);

        const modelPath = `${MODEL_URL}model.json`;
        const metadataPath = `${MODEL_URL}metadata.json`;

        try {
            // @ts-ignore
            const loadedModel = await window.tmImage.load(modelPath, metadataPath);
            setModel(loadedModel);

            // @ts-ignore
            const webcamInstance = new window.tmImage.Webcam(250, 250, true); // width, height, flip
            await webcamInstance.setup();
            await webcamInstance.play();
            setWebcam(webcamInstance);

            webcamRef.current.innerHTML = '';
            webcamRef.current.appendChild(webcamInstance.canvas);
        } catch (error) {
            console.error("Error initializing Teachable Machine:", error);
            // Handle error state appropriately
        }
    }, []);

    const predict = useCallback(async () => {
        if (model && webcam) {
            const prediction = await model.predict(webcam.canvas);
            setPredictions(prediction);
        }
    }, [model, webcam]);

    const loop = useCallback(async () => {
        if (webcam) {
            webcam.update();
            await predict();
            requestRef.current = requestAnimationFrame(loop);
        }
    }, [webcam, predict]);

    useEffect(() => {
        if (model && webcam && gameState === GameState.LOADING_MODEL) {
             setIsModelLoading(false);
             setGameState(GameState.PREDICT);
             requestRef.current = requestAnimationFrame(loop);
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [model, webcam, gameState, loop]);
    
    const startNewLevel = useCallback((levelIndex: number) => {
        setErrorGrid(Array(COLUMNS).fill(0));
        setSuccessGrid(Array(COLUMNS).fill(0));
        setLevelScore(0);
        setPredictions([]);
        
        if (model) {
          setGameState(GameState.PREDICT);
        } else {
          initTeachableMachine();
        }
    }, [model, initTeachableMachine]);

    const checkGesture = useCallback((detectedGesture: Gesture) => {
        const requiredGesture = LEVELS[currentLevel].requiredGesture;
        const newErrorGrid = Array(COLUMNS).fill(0);
        const newSuccessGrid = Array(COLUMNS).fill(0);
        let score = 0;

        if (detectedGesture === requiredGesture) {
            score = 50;
            LEVELS[currentLevel].pattern.forEach(col => newSuccessGrid[col] = 1);
        } else {
            score = -25;
            const errorPattern = GESTURE_PATTERNS[detectedGesture] || [];
            errorPattern.forEach(col => newErrorGrid[col] = 1);
        }

        setLevelScore(score);
        setTotalScore(prev => prev + score);
        setSuccessGrid(newSuccessGrid);
        setErrorGrid(newErrorGrid);
        setGameState(GameState.COMPARE);
    }, [currentLevel]);
    
    useEffect(() => {
        if (gameState !== GameState.PREDICT || predictions.length === 0) return;
        
        const topPrediction = predictions.reduce((prev, current) => (prev.probability > current.probability) ? prev : current);

        if (topPrediction && topPrediction.probability > 0.95) {
            const detectedGesture = KOREAN_TO_GESTURE[topPrediction.className];
            if (detectedGesture && detectedGesture !== Gesture.Neutral) {
                checkGesture(detectedGesture);
            }
        }

    }, [predictions, gameState, checkGesture]);


    useEffect(() => {
        let timer: number;
        if (gameState === GameState.COMPARE) {
            timer = window.setTimeout(() => setGameState(GameState.LEVEL_CLEAR), COMPARE_DURATION);
        }
        return () => clearTimeout(timer);
    }, [gameState]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.code === 'Enter') {
            if (gameState === GameState.START && isLibraryLoaded) {
                startNewLevel(currentLevel);
            } else if (gameState === GameState.LEVEL_CLEAR) {
                const nextLevel = currentLevel + 1;
                if (nextLevel < LEVELS.length) {
                    setCurrentLevel(nextLevel);
                    startNewLevel(nextLevel);
                } else {
                    setGameState(GameState.GAME_OVER);
                }
            }
        } else if (event.code === 'Escape' && gameState === GameState.GAME_OVER) {
             setGameState(GameState.START);
             setCurrentLevel(0);
             setTotalScore(0);
             // Stop webcam
             if (webcam) {
                webcam.stop();
                setWebcam(null);
                setModel(null);
             }
        }
    }, [gameState, currentLevel, startNewLevel, webcam, isLibraryLoaded]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const currentLevelData = LEVELS[currentLevel] || LEVELS[0];
    
    const getGameMessage = () => {
        if (gameState === GameState.START && !isLibraryLoaded) {
            return { title: "Initializing AI Libraries...", subtitle: "Please wait." };
        }
        const message = GAME_STATE_MESSAGES[gameState];
        
        if (gameState === GameState.START && isLibraryLoaded) {
             return { ...message, subtitle: "Press [ENTER] to Begin" };
        }
        return message;
    }
    
    const message = getGameMessage();


    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6">
            <HUD
                levelName={currentLevelData.name}
                totalScore={totalScore}
                levelScore={levelScore}
                gameState={gameState}
                hint={currentLevelData.hint}
            />
             <div className="w-full flex-grow flex flex-col md:flex-row items-center justify-center gap-8 my-4">
                <GameGrid
                    stimulusGrid={LEVELS[currentLevel]?.pattern || []}
                    errorGrid={errorGrid}
                    successGrid={successGrid}
                    gameState={gameState}
                />
                <WebcamView 
                    webcamRef={webcamRef} 
                    isModelLoading={isModelLoading} 
                    predictions={predictions}
                    gameState={gameState}
                />
            </div>
             <div className="h-16 mt-4 flex items-center justify-center text-center">
                 <p className="text-xl text-yellow-400 font-semibold">{message?.title}</p>
                 {message?.subtitle && (
                      <p className="text-md text-gray-400 ml-4 animate-pulse">{message?.subtitle}</p>
                 )}
            </div>
        </div>
    );
};

export default App;
