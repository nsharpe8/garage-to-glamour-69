
import React from 'react';
import { GameOverScreenProps } from './types';

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  earnedReward,
  formatBitcoin
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md backdrop-blur-sm">
      <div className="text-center bg-slate-800 p-6 rounded-md shadow-lg border border-yellow-500">
        <div className="text-2xl font-bold text-white mb-2">Game Over!</div>
        <div className="text-yellow-400 text-lg font-medium mb-1">
          Score: {score}
        </div>
        <div className="text-green-400 font-medium">
          Reward: {formatBitcoin(earnedReward)} BTC
        </div>
      </div>
    </div>
  );
};
