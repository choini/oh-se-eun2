
import React from 'react';
import { GameState } from '../types';
import { COLUMNS, LAYERS, LAYER_II_III, LAYER_IV } from '../constants';

interface GameGridProps {
    stimulusGrid: number[];
    errorGrid: number[];
    successGrid: number[];
    gameState: GameState;
}

const LayerLabel: React.FC<{ label: string; y: number }> = ({ label, y }) => (
    <div className="absolute left-2 text-gray-400 text-xs sm:text-sm select-none" style={{ top: `${y + 20}px` }}>
        {label}
    </div>
);

const GameGrid: React.FC<GameGridProps> = ({
    stimulusGrid,
    errorGrid,
    successGrid,
    gameState,
}) => {
    const cellHeight = 70;
    const gridHeight = cellHeight * LAYERS;

    const layerDefs = [
        { label: "Layer I", index: 0 },
        { label: "Layer II/III (Feedback)", index: LAYER_II_III },
        { label: "Layer IV (Goal Pattern)", index: LAYER_IV },
        { label: "Layer V/VI", index: 5 },
    ];

    return (
        <div className="relative w-full max-w-4xl mx-auto" style={{ height: `${gridHeight}px` }}>
            {/* Layer Lines and Labels */}
            {Array.from({ length: LAYERS + 1 }).map((_, i) => (
                <div key={`layer-line-${i}`} className="absolute w-full border-t border-gray-700" style={{ top: `${i * cellHeight}px` }} />
            ))}
            {layerDefs.map(def => <LayerLabel key={def.label} label={def.label} y={def.index * cellHeight} />)}

            <div className="absolute top-0 left-0 w-full h-full grid" style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}>
                {/* Column Lines */}
                {Array.from({ length: COLUMNS -1 }).map((_, i) => (
                    <div key={`col-line-${i}`} className="h-full border-r border-gray-700" style={{gridColumnStart: i + 2}} />
                ))}

                {/* Neurons */}
                {Array.from({ length: COLUMNS }).map((_, col) => (
                    <div key={`col-${col}`} className="relative h-full" style={{ gridColumn: col + 1 }}>
                        
                        {/* Stimulus Neuron (Goal) - Shows during compare */}
                        {gameState === GameState.COMPARE && stimulusGrid.includes(col) && (
                            <div className="absolute w-full transition-colors duration-300 bg-green-500 animate-pulse" style={{ top: `${LAYER_IV * cellHeight}px`, height: `${cellHeight}px` }} />
                        )}

                        {/* Error Neuron */}
                        {errorGrid[col] === 1 && (
                            <div className="absolute w-full transition-colors duration-300 bg-red-600" style={{ top: `${LAYER_II_III * cellHeight}px`, height: `${cellHeight}px` }} />
                        )}

                        {/* Success Neuron */}
                        {successGrid[col] === 1 && (
                            <div className="absolute w-full transition-colors duration-300 bg-cyan-400" style={{ top: `${LAYER_II_III * cellHeight}px`, height: `${cellHeight}px` }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameGrid;