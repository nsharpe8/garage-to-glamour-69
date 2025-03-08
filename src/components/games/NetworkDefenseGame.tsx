
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Clock, Shield } from 'lucide-react';
import { MiniGame as MiniGameType } from '@/types/gameTypes';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { GameCanvas } from './NetworkDefenseGame/GameCanvas';
import { GameHUD } from './NetworkDefenseGame/GameHUD';
import { GameOverScreen } from './NetworkDefenseGame/GameOverScreen';

interface NetworkDefenseGameProps {
  game: MiniGameType;
}

const NetworkDefenseGame: React.FC<NetworkDefenseGameProps> = ({ game }) => {
  const { playMiniGame, formatBitcoin, dispatch } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [earnedReward, setEarnedReward] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 0 });
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(15); // 15 seconds game
  const [viruses, setViruses] = useState([]);
  const [bullets, setBullets] = useState([]);
  
  const now = Date.now();
  const cooldownEnds = game.lastPlayed + (game.cooldown * 1000);
  const isOnCooldown = now < cooldownEnds;
  const remainingCooldown = Math.ceil((cooldownEnds - now) / 1000);

  const startGame = () => {
    if (isOnCooldown || isPlaying) return;
    
    setIsPlaying(true);
    setGameCompleted(false);
    setScore(0);
    setGameTime(15);
    setViruses([]);
    setBullets([]);
    setPlayerPosition({ x: 50, y: 0 });
    
    toast({
      title: "Network Defense",
      description: "Defend your network from viruses!",
    });
    
    // Check for defender achievement if score reaches 500
    if (score >= 500) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 3 }); // ID 3 is "Defender" achievement
    }
  };
  
  const endGame = () => {
    setGameCompleted(true);
    
    const baseBTC = 0.0001;
    const scoreMultiplier = score / 100;
    const reward = baseBTC + (scoreMultiplier * 0.0001);
    
    setEarnedReward(reward);
    playMiniGame(game.id, reward);
    
    toast({
      title: "Game Completed!",
      description: `You scored ${score} points and earned ${formatBitcoin(reward)} BTC!`,
    });
    
    setTimeout(() => {
      setIsPlaying(false);
      setGameCompleted(false);
    }, 3000);
  };

  const updateScore = (points: number) => {
    const newScore = score + points;
    setScore(newScore);
    
    // Update quest progress periodically
    if (newScore % 50 === 0) {
      const virusHunterQuest = 3; // ID of the virus hunter quest
      dispatch({ 
        type: 'UPDATE_QUEST_PROGRESS', 
        payload: { 
          id: virusHunterQuest, 
          progress: newScore / 10 // Each virus is worth 10 points
        } 
      });
    }
  };
  
  return (
    <div>
      {isOnCooldown ? (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Available in {Math.floor(remainingCooldown / 60)}:{(remainingCooldown % 60).toString().padStart(2, '0')}</span>
        </div>
      ) : isPlaying ? (
        <div className="h-[300px] w-full relative rounded-md overflow-hidden shadow-lg">
          <GameCanvas 
            playerPosition={playerPosition}
            setPlayerPosition={setPlayerPosition}
            viruses={viruses}
            setViruses={setViruses}
            bullets={bullets}
            setBullets={setBullets}
            gameTime={gameTime}
            setGameTime={setGameTime}
            score={score}
            updateScore={updateScore}
            endGame={endGame}
          />
          
          {gameCompleted && (
            <GameOverScreen
              score={score}
              earnedReward={earnedReward}
              formatBitcoin={formatBitcoin}
            />
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-2">
            <Shield className="w-4 h-4 mr-1 text-blue-500" />
            <span className="text-sm text-gray-700">
              Use your mouse to move, click to shoot viruses!
            </span>
          </div>
          <button
            onClick={startGame}
            className="w-full py-2 rounded-lg font-medium transition-all bg-bitcoin text-white hover:bg-bitcoin-dark"
          >
            Play Now
          </button>
        </div>
      )}
    </div>
  );
};

export default NetworkDefenseGame;
