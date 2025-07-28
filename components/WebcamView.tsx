
import React, { RefObject } from 'react';
import { GameState, Prediction } from '../types';

interface WebcamViewProps {
    webcamRef: RefObject<HTMLDivElement>;
    isModelLoading: boolean;
    predictions: Prediction[];
    gameState: GameState;
}

const WebcamView: React.FC<WebcamViewProps> = ({ webcamRef, isModelLoading, predictions, gameState }) => {
    const getBarColor = (probability: number) => {
        if (probability > 0.9) return 'bg-green-500';
        if (probability > 0.75) return 'bg-yellow-500';
        return 'bg-gray-500';
    }
    
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg shadow-lg w-full md:w-auto">
            <div 
                ref={webcamRef} 
                className="w-[250px] h-[250px] bg-gray-700 rounded-md overflow-hidden flex items-center justify-center text-gray-400"
            >
                {isModelLoading && <p>Starting camera...</p>}
            </div>
            <div className="mt-4 w-full">
                {gameState === GameState.PREDICT && predictions.length > 0 && (
                    <div className="space-y-2">
                        {predictions.map(p => (
                             <div key={p.className} className="w-full">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white font-medium">{p.className}</span>
                                    <span className="text-gray-300">{(p.probability * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2.5">
                                    <div 
                                        className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${getBarColor(p.probability)}`}
                                        style={{ width: `${p.probability * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebcamView;