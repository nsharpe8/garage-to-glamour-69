
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { gameReducer } from '@/reducers/gameReducer';
import { formatBitcoin, formatCash } from '@/utils/gameUtils';
import { initialState } from '@/data/gameData';
import { GameState } from '@/types/gameTypes';
import { toast } from '@/components/ui/use-toast';

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<any>;
  formatBitcoin: (value: number) => string;
  formatCash: (value: number) => string;
  playMiniGame: (gameId: number, reward: number) => void;
  hashrateBoost: number;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [previousHashrate, setPreviousHashrate] = useState(state.hashrate);
  const [hashrateBoost, setHashrateBoost] = useState(0);

  // Detect hashrate changes and show notifications/animations
  useEffect(() => {
    if (state.hashrate > previousHashrate && previousHashrate > 0) {
      const increase = state.hashrate - previousHashrate;
      
      // Show toast notification for significant hashrate increases
      if (increase >= 5) {
        toast({
          title: "Mining Power Increased!",
          description: `+${increase} H/s added to your mining operation.`,
          variant: "default",
        });
      }
      
      // Set a temporary boost effect that will fade out
      setHashrateBoost(increase);
      setTimeout(() => {
        setHashrateBoost(0);
      }, 3000);
    }
    
    setPreviousHashrate(state.hashrate);
  }, [state.hashrate, previousHashrate]);

  // Passive mining effect - runs every second with increased rate
  useEffect(() => {
    const miningInterval = setInterval(() => {
      if (state.hashrate > 0) {
        dispatch({ type: 'COLLECT_PASSIVE_INCOME' });
      }
    }, 500); // Reduced from 1000ms to 500ms for faster passive mining

    return () => clearInterval(miningInterval);
  }, [state.hashrate]);

  // Random events effect with increased frequency
  useEffect(() => {
    const eventInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastEvent = now - state.lastEventTime;
      
      // Random events happen every 20-60 seconds (reduced from 30-90)
      if (timeSinceLastEvent > 20000 && Math.random() < 0.15) { // Increased probability from 0.1 to 0.15
        dispatch({ type: 'TRIGGER_RANDOM_EVENT' });
      }
    }, 8000); // Reduced from 10000ms to 8000ms

    return () => clearInterval(eventInterval);
  }, [state.lastEventTime]);

  // Update leaderboard occasionally
  useEffect(() => {
    const leaderboardInterval = setInterval(() => {
      dispatch({ type: 'UPDATE_LEADERBOARD' });
    }, 60000);

    return () => clearInterval(leaderboardInterval);
  }, []);

  // Mini game function
  const playMiniGame = (gameId: number, reward: number) => {
    dispatch({ 
      type: 'PLAY_MINI_GAME', 
      payload: { gameId, reward } 
    });
  };

  return (
    <GameContext.Provider value={{ 
      state, 
      dispatch, 
      formatBitcoin, 
      formatCash,
      playMiniGame,
      hashrateBoost
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
