
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { gameReducer } from '@/reducers/gameReducer';
import { formatBitcoin, formatCash } from '@/utils/gameUtils';
import { initialState } from '@/data/gameData';
import { GameState, MiniGame } from '@/types/gameTypes';

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<any>;
  formatBitcoin: (value: number) => string;
  formatCash: (value: number) => string;
  playMiniGame: (gameId: number, reward: number) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Passive mining effect - runs every second
  useEffect(() => {
    const miningInterval = setInterval(() => {
      if (state.hashrate > 0) {
        dispatch({ type: 'COLLECT_PASSIVE_INCOME' });
      }
    }, 1000);

    return () => clearInterval(miningInterval);
  }, [state.hashrate]);

  // Random events effect
  useEffect(() => {
    const eventInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastEvent = now - state.lastEventTime;
      
      // Random events happen every 30-90 seconds
      if (timeSinceLastEvent > 30000 && Math.random() < 0.1) {
        dispatch({ type: 'TRIGGER_RANDOM_EVENT' });
      }
    }, 10000);

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
      playMiniGame
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
