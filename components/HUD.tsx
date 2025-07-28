
import React from 'react';
import { GameState } from '../types';

interface HUDProps {
    levelName: string;
    totalScore: number;
    levelScore: number;
    gameState: GameState;
    hint: string;
}

const HUD: React.FC<HUDProps> = ({ levelName, totalScore, levelScore, gameState, hint }) => {
    return (
        <div className="w-full max-w-7xl mx-auto mb-4 p-2 rounded-lg bg-gray-800/50 flex justify-between items-center">
            <div className="text-left">
                <h1 className="text-lg sm:text-xl font-bold text-white">{levelName}</h1>
                {(gameState === GameState.PREDICT || gameState === GameState.LOADING_MODEL) && (
                    <p className="text-sm text-yellow-300 animate-pulse">{hint}</p>
                )}
                {gameState === GameState.COMPARE && (
                    <p className={`text-sm font-semibold ${levelScore > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Round Score: {levelScore}
                    </p>
                )}
            </div>
            <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-white">Total Score</p>
                <p className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-400">{totalScore}</p>
            </div>
        </div>
    );
};

export default HUD;