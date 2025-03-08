
import React from 'react';
import { GameHUDProps } from './types';

export const GameHUD: React.FC<GameHUDProps> = ({ score, gameTime, totalGameTime }) => {
  // This component provides a DOM-based HUD alternative to the canvas rendering
  // Currently, the HUD is rendered in the canvas for simplicity
  // This component can be used if we want to switch to DOM rendering later
  return (
    <div className="absolute top-0 left-0 w-full p-2 text-white z-10 pointer-events-none">
      <div className="flex justify-between items-center">
        <div className="font-bold text-lg">Score: {score}</div>
        <div className="flex items-center">
          <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${gameTime < 5 ? 'bg-red-500' : gameTime < 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${(gameTime / totalGameTime) * 100}%` }}
            />
          </div>
          <span className="ml-2 text-xs">{gameTime}s</span>
        </div>
      </div>
    </div>
  );
};
