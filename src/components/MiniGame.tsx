
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Gamepad2, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MiniGameProps {
  gameId: number;
}

const MiniGame: React.FC<MiniGameProps> = ({ gameId }) => {
  const { state, playMiniGame, formatBitcoin } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const game = state.miniGames.find(g => g.id === gameId);
  
  if (!game) return null;
  
  const now = Date.now();
  const cooldownEnds = game.lastPlayed + (game.cooldown * 1000);
  const isOnCooldown = now < cooldownEnds;
  const remainingCooldown = Math.ceil((cooldownEnds - now) / 1000);
  
  const canPlay = game.unlocked && !isOnCooldown && !isPlaying;
  
  const handlePlay = () => {
    if (!canPlay) return;
    
    setIsPlaying(true);
    
    // Simulate game play (in a real implementation, this would be a proper game)
    setTimeout(() => {
      const reward = 0.0001 + (Math.random() * 0.0005); // Random reward between 0.0001 and 0.0006 BTC
      playMiniGame(gameId, reward);
      setGameCompleted(true);
      
      setTimeout(() => {
        setIsPlaying(false);
        setGameCompleted(false);
      }, 2000);
    }, 2000); // Simulate 2 seconds of gameplay
  };
  
  if (!game.unlocked) {
    return (
      <div className="glass-panel rounded-xl p-4 opacity-70">
        <div className="flex items-center mb-2">
          <Lock className="w-5 h-5 mr-2 text-gray-500" />
          <h3 className="font-medium">{game.name}</h3>
        </div>
        <p className="text-sm text-gray-500">Unlock by reaching level {game.id + 2}</p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "glass-panel rounded-xl p-4 transition-all",
      isPlaying ? "bg-bitcoin/5" : "bg-white/50"
    )}>
      <div className="flex items-center mb-2">
        <Gamepad2 className="w-5 h-5 mr-2 text-gray-700" />
        <h3 className="font-medium">{game.name}</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{game.description}</p>
      
      {isOnCooldown ? (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Available in {Math.floor(remainingCooldown / 60)}:{(remainingCooldown % 60).toString().padStart(2, '0')}</span>
        </div>
      ) : isPlaying ? (
        <div className="h-10 flex items-center justify-center">
          {gameCompleted ? (
            <div className="text-green-600 font-medium">
              You earned {formatBitcoin(0.0005)} BTC!
            </div>
          ) : (
            <div className="animate-pulse">Playing...</div>
          )}
        </div>
      ) : (
        <button
          onClick={handlePlay}
          className={cn(
            "w-full py-2 rounded-lg font-medium transition-all",
            canPlay
              ? "bg-bitcoin text-white hover:bg-bitcoin-dark"
              : "bg-gray-100 text-gray-400"
          )}
          disabled={!canPlay}
        >
          Play Now
        </button>
      )}
    </div>
  );
};

export default MiniGame;
