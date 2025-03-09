
import React from 'react';
import { GameHUDProps } from './types';

export const GameHUD: React.FC<GameHUDProps> = ({ score, gameTime, totalGameTime }) => {
  // Calculate percentage for visual time indicator
  const timePercentage = (gameTime / totalGameTime) * 100;
  
  // Determine color based on remaining time
  const getTimerColor = () => {
    if (gameTime < 5) return 'bg-red-500';
    if (gameTime < 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="absolute top-0 left-0 w-full p-2 text-white z-10 pointer-events-none">
      <div className="flex justify-between items-center">
        <div className="font-bold text-lg">Score: {score}</div>
        <div className="flex items-center">
          <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${getTimerColor()}`}
              style={{ width: `${Math.max(0, Math.min(100, timePercentage))}%` }}
            />
          </div>
          <span className="ml-2 text-xs">{Math.max(0, Math.round(gameTime))}s</span>
        </div>
      </div>
    </div>
  );
};
