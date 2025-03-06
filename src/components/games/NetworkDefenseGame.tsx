
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Clock } from 'lucide-react';
import { MiniGame as MiniGameType } from '@/types/gameTypes';
import { toast } from "@/components/ui/use-toast";

interface NetworkDefenseGameProps {
  game: MiniGameType;
}

const NetworkDefenseGame: React.FC<NetworkDefenseGameProps> = ({ game }) => {
  const { playMiniGame, formatBitcoin } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [earnedReward, setEarnedReward] = useState(0);
  
  const now = Date.now();
  const cooldownEnds = game.lastPlayed + (game.cooldown * 1000);
  const isOnCooldown = now < cooldownEnds;
  const remainingCooldown = Math.ceil((cooldownEnds - now) / 1000);
  
  // This is a placeholder for the third game
  // For now, this game will just be a simple timer with a reward
  
  const startGame = () => {
    if (isOnCooldown || isPlaying) return;
    
    setIsPlaying(true);
    
    toast({
      title: "Network Defense",
      description: "Defending your mining operation from hackers...",
    });
    
    // Simulate gameplay
    setTimeout(() => {
      const baseBTC = 0.0002;
      const randomBonus = Math.random() * 0.0006;
      const levelMultiplier = 1 + (game.id * 0.15);
      const reward = (baseBTC + randomBonus) * levelMultiplier;
      
      setEarnedReward(reward);
      setGameCompleted(true);
      playMiniGame(game.id, reward);
      
      setTimeout(() => {
        setIsPlaying(false);
        setGameCompleted(false);
      }, 3000);
    }, 3000);
  };
  
  return (
    <div>
      {isOnCooldown ? (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Available in {Math.floor(remainingCooldown / 60)}:{(remainingCooldown % 60).toString().padStart(2, '0')}</span>
        </div>
      ) : isPlaying ? (
        <div className="h-10 flex items-center justify-center">
          {gameCompleted ? (
            <div className="text-green-600 font-medium">
              You earned {formatBitcoin(earnedReward)} BTC!
            </div>
          ) : (
            <div className="animate-pulse">Defending network...</div>
          )}
        </div>
      ) : (
        <button
          onClick={startGame}
          className="w-full py-2 rounded-lg font-medium transition-all bg-bitcoin text-white hover:bg-bitcoin-dark"
        >
          Play Now
        </button>
      )}
    </div>
  );
};

export default NetworkDefenseGame;
