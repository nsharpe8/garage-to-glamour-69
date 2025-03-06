
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Gamepad2, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import HashPuzzleGame from './games/HashPuzzleGame';
import CryptoTraderGame from './games/CryptoTraderGame';
import NetworkDefenseGame from './games/NetworkDefenseGame';

interface MiniGameProps {
  gameId: number;
}

const MiniGame: React.FC<MiniGameProps> = ({ gameId }) => {
  const { state } = useGame();
  const game = state.miniGames.find(g => g.id === gameId);
  
  if (!game) return null;
  
  // Check if game is locked
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
  
  // Render the appropriate game based on gameId
  const renderGame = () => {
    switch (gameId) {
      case 1:
        return <HashPuzzleGame game={game} />;
      case 2:
        return <CryptoTraderGame game={game} />;
      case 3:
        return <NetworkDefenseGame game={game} />;
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 bg-white/50">
      <div className="flex items-center mb-2">
        <Gamepad2 className="w-5 h-5 mr-2 text-gray-700" />
        <h3 className="font-medium">{game.name}</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{game.description}</p>
      
      {renderGame()}
    </div>
  );
};

export default MiniGame;
