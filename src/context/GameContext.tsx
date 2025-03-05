import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

// Types
export interface MiningRig {
  id: number;
  name: string;
  hashrate: number;
  power: number;
  price: number;
  owned: boolean;
  quantity: number;
}

export interface Asset {
  id: number;
  name: string;
  category: 'home' | 'car' | 'watch' | 'vacation' | 'luxury';
  price: number;
  image: string;
  owned: boolean;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  worth: number;
  isPlayer: boolean;
}

export interface RandomEvent {
  id: number;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  effect: 'bitcoin' | 'cash' | 'hashrate' | 'experience';
  value: number;
  duration?: number; // in seconds, for temporary effects
}

export interface MiniGame {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  played: boolean;
  cooldown: number; // in seconds
  lastPlayed: number; // timestamp
}

export interface GameState {
  bitcoin: number;
  cash: number;
  hashrate: number;
  miningRigs: MiningRig[];
  assets: Asset[];
  level: number;
  experience: number;
  lastMined: number;
  isFirstVisit: boolean;
  leaderboard: LeaderboardEntry[];
  playerRank: number;
  activeEvents: RandomEvent[];
  miniGames: MiniGame[];
  lastEventTime: number;
}

type GameAction =
  | { type: 'MINE_BITCOIN' }
  | { type: 'BUY_RIG'; payload: number }
  | { type: 'SELL_RIG'; payload: number }
  | { type: 'UPGRADE_RIG'; payload: number }
  | { type: 'BUY_ASSET'; payload: number }
  | { type: 'SELL_BITCOIN'; payload: number }
  | { type: 'COLLECT_PASSIVE_INCOME' }
  | { type: 'DISMISS_FIRST_VISIT' }
  | { type: 'TRIGGER_RANDOM_EVENT' }
  | { type: 'RESOLVE_EVENT'; payload: number }
  | { type: 'PLAY_MINI_GAME'; payload: { gameId: number; reward: number } }
  | { type: 'UPDATE_LEADERBOARD' };

const initialRigs: MiningRig[] = [
  {
    id: 1,
    name: 'Basic GPU',
    hashrate: 1,
    power: 100,
    price: 500,
    owned: true,
    quantity: 1,
  },
  {
    id: 2,
    name: 'Mining GPU',
    hashrate: 5,
    power: 250,
    price: 2000,
    owned: false,
    quantity: 0,
  },
  {
    id: 3,
    name: 'ASIC Miner',
    hashrate: 25,
    power: 500,
    price: 8000,
    owned: false,
    quantity: 0,
  },
  {
    id: 4,
    name: 'Mining Farm',
    hashrate: 100,
    power: 2000,
    price: 30000,
    owned: false,
    quantity: 0,
  },
];

const initialAssets: Asset[] = [
  {
    id: 1,
    name: 'Studio Apartment',
    category: 'home',
    price: 50000,
    image: 'apartment',
    owned: false,
  },
  {
    id: 2,
    name: 'Compact Car',
    category: 'car',
    price: 20000,
    image: 'compact-car',
    owned: false,
  },
  {
    id: 3,
    name: 'Analog Watch',
    category: 'watch',
    price: 5000,
    image: 'analog-watch',
    owned: false,
  },
  {
    id: 4,
    name: 'Weekend Trip',
    category: 'vacation',
    price: 2000,
    image: 'weekend-trip',
    owned: false,
  },
  {
    id: 5,
    name: 'Luxury Condo',
    category: 'home',
    price: 500000,
    image: 'luxury-condo',
    owned: false,
  },
  {
    id: 6,
    name: 'Sports Car',
    category: 'car',
    price: 200000,
    image: 'sports-car',
    owned: false,
  },
  {
    id: 7,
    name: 'Luxury Watch',
    category: 'watch',
    price: 50000,
    image: 'luxury-watch',
    owned: false,
  },
  {
    id: 8,
    name: 'Exotic Vacation',
    category: 'vacation',
    price: 20000,
    image: 'exotic-vacation',
    owned: false,
  },
  {
    id: 9,
    name: 'Mansion',
    category: 'home',
    price: 2000000,
    image: 'mansion',
    owned: false,
  },
  {
    id: 10,
    name: 'Luxury Yacht',
    category: 'luxury',
    price: 5000000,
    image: 'yacht',
    owned: false,
  },
  {
    id: 11,
    name: 'Private Jet',
    category: 'luxury',
    price: 20000000,
    image: 'private-jet',
    owned: false,
  },
  {
    id: 12,
    name: 'Island Retreat',
    category: 'luxury',
    price: 50000000,
    image: 'island',
    owned: false,
  },
];

const initialRandomEvents: RandomEvent[] = [
  {
    id: 1,
    title: 'Market Surge',
    description: 'Bitcoin price has surged! Sell now for a 20% bonus!',
    type: 'positive',
    effect: 'bitcoin',
    value: 0.2, // 20% increase
  },
  {
    id: 2,
    title: 'Power Outage',
    description: 'A local power outage has slowed your mining operations by 30% for 30 seconds.',
    type: 'negative',
    effect: 'hashrate',
    value: -0.3, // 30% decrease
    duration: 30,
  },
  {
    id: 3,
    title: 'Cooling Optimization',
    description: 'You optimized your cooling system! Mining efficiency increased by 25% for 45 seconds.',
    type: 'positive',
    effect: 'hashrate',
    value: 0.25, // 25% increase
    duration: 45,
  },
  {
    id: 4,
    title: 'Mining Pool Bonus',
    description: 'Your mining pool found a block! You received a small bonus.',
    type: 'positive',
    effect: 'bitcoin',
    value: 0.001, // Fixed amount
  },
  {
    id: 5,
    title: 'New Mining Technique',
    description: 'You learned a new technique! Gain 5 experience points.',
    type: 'positive',
    effect: 'experience',
    value: 5,
  },
];

const initialMiniGames: MiniGame[] = [
  {
    id: 1,
    name: 'Hash Puzzle',
    description: 'Solve a puzzle to earn Bitcoin.',
    unlocked: true,
    played: false,
    cooldown: 300, // 5 minutes
    lastPlayed: 0,
  },
  {
    id: 2,
    name: 'Crypto Trader',
    description: 'Test your trading skills to earn cash.',
    unlocked: false,
    played: false,
    cooldown: 600, // 10 minutes
    lastPlayed: 0,
  },
  {
    id: 3,
    name: 'Network Defense',
    description: 'Defend your mining operation from hackers.',
    unlocked: false,
    played: false,
    cooldown: 900, // 15 minutes
    lastPlayed: 0,
  },
];

const initialLeaderboard: LeaderboardEntry[] = [
  { id: 1, name: 'Elon Musk', worth: 250000000000, isPlayer: false },
  { id: 2, name: 'Jeff Bezos', worth: 200000000000, isPlayer: false },
  { id: 3, name: 'Bernard Arnault', worth: 190000000000, isPlayer: false },
  { id: 4, name: 'Bill Gates', worth: 150000000000, isPlayer: false },
  { id: 5, name: 'Mark Zuckerberg', worth: 120000000000, isPlayer: false },
  { id: 6, name: 'Warren Buffett', worth: 110000000000, isPlayer: false },
  { id: 7, name: 'Larry Ellison', worth: 100000000000, isPlayer: false },
  { id: 8, name: 'Larry Page', worth: 90000000000, isPlayer: false },
  { id: 9, name: 'Sergey Brin', worth: 85000000000, isPlayer: false },
  { id: 10, name: 'Steve Ballmer', worth: 80000000000, isPlayer: false },
  // Player will be inserted based on wealth
];

const initialState: GameState = {
  bitcoin: 0,
  cash: 1000,
  hashrate: 1,
  miningRigs: initialRigs,
  assets: initialAssets,
  level: 1,
  experience: 0,
  lastMined: Date.now(),
  isFirstVisit: true,
  leaderboard: initialLeaderboard,
  playerRank: initialLeaderboard.length + 1,
  activeEvents: [],
  miniGames: initialMiniGames,
  lastEventTime: Date.now(),
};

const calculateTotalHashrate = (rigs: MiningRig[]): number => {
  return rigs.reduce((total, rig) => {
    return total + (rig.owned ? rig.hashrate * rig.quantity : 0);
  }, 0);
};

const BITCOIN_VALUE = 30000; // $30,000 per BTC
const MINING_RATE = 0.00001; // BTC per hashrate per second

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'MINE_BITCOIN': {
      const now = Date.now();
      const elapsedSeconds = (now - state.lastMined) / 1000;
      const minedBitcoin = state.hashrate * MINING_RATE * elapsedSeconds;
      
      let experience = state.experience + 1;
      let level = state.level;
      
      if (experience >= state.level * 10) {
        level += 1;
        experience = 0;
      }
      
      return {
        ...state,
        bitcoin: state.bitcoin + minedBitcoin,
        lastMined: now,
        level,
        experience,
      };
    }
    
    case 'BUY_RIG': {
      const rigId = action.payload;
      const rig = state.miningRigs.find(r => r.id === rigId);
      
      if (!rig || state.cash < rig.price) {
        return state;
      }
      
      const updatedRigs = state.miningRigs.map(r => {
        if (r.id === rigId) {
          return {
            ...r,
            owned: true,
            quantity: r.quantity + 1,
          };
        }
        return r;
      });
      
      return {
        ...state,
        cash: state.cash - rig.price,
        miningRigs: updatedRigs,
        hashrate: calculateTotalHashrate(updatedRigs),
      };
    }
    
    case 'SELL_RIG': {
      const rigId = action.payload;
      const rig = state.miningRigs.find(r => r.id === rigId);
      
      if (!rig || !rig.owned || rig.quantity <= 0) {
        return state;
      }
      
      const updatedRigs = state.miningRigs.map(r => {
        if (r.id === rigId) {
          const newQuantity = r.quantity - 1;
          return {
            ...r,
            owned: newQuantity > 0,
            quantity: newQuantity,
          };
        }
        return r;
      });
      
      return {
        ...state,
        cash: state.cash + (rig.price * 0.5),
        miningRigs: updatedRigs,
        hashrate: calculateTotalHashrate(updatedRigs),
      };
    }
    
    case 'BUY_ASSET': {
      const assetId = action.payload;
      const asset = state.assets.find(a => a.id === assetId);
      
      if (!asset || state.cash < asset.price || asset.owned) {
        return state;
      }
      
      const updatedAssets = state.assets.map(a => {
        if (a.id === assetId) {
          return {
            ...a,
            owned: true,
          };
        }
        return a;
      });
      
      return {
        ...state,
        cash: state.cash - asset.price,
        assets: updatedAssets,
        experience: state.experience + 5,
      };
    }
    
    case 'SELL_BITCOIN': {
      const amount = action.payload;
      
      if (amount <= 0 || amount > state.bitcoin) {
        return state;
      }
      
      return {
        ...state,
        bitcoin: state.bitcoin - amount,
        cash: state.cash + (amount * BITCOIN_VALUE),
      };
    }
    
    case 'COLLECT_PASSIVE_INCOME': {
      const now = Date.now();
      const elapsedSeconds = (now - state.lastMined) / 1000;
      const minedBitcoin = state.hashrate * MINING_RATE * elapsedSeconds;
      
      return {
        ...state,
        bitcoin: state.bitcoin + minedBitcoin,
        lastMined: now,
      };
    }
    
    case 'DISMISS_FIRST_VISIT': {
      return {
        ...state,
        isFirstVisit: false,
      };
    }
    
    case 'TRIGGER_RANDOM_EVENT': {
      const now = Date.now();
      if (now - state.lastEventTime < 120000) {
        return state;
      }

      if (Math.random() > 0.25) {
        return {
          ...state,
          lastEventTime: now,
        };
      }

      const randomEvent = initialRandomEvents[Math.floor(Math.random() * initialRandomEvents.length)];
      
      const eventInstance = {
        ...randomEvent,
        id: randomEvent.id + now,
      };

      toast({
        title: eventInstance.title,
        description: eventInstance.description,
        variant: eventInstance.type === 'positive' ? 'default' : 'destructive',
      });

      if (!eventInstance.duration) {
        let newState = { ...state };
        
        switch (eventInstance.effect) {
          case 'bitcoin':
            if (eventInstance.value < 1) {
              newState.bitcoin += state.bitcoin * eventInstance.value;
            } else {
              newState.bitcoin += eventInstance.value;
            }
            break;
          case 'cash':
            if (eventInstance.value < 1) {
              newState.cash += state.cash * eventInstance.value;
            } else {
              newState.cash += eventInstance.value;
            }
            break;
          case 'experience':
            newState.experience += eventInstance.value;
            if (newState.experience >= newState.level * 10) {
              newState.level += 1;
              newState.experience = 0;
              toast({
                title: "Level Up!",
                description: `You reached level ${newState.level}!`,
              });
            }
            break;
        }
        
        return {
          ...newState,
          lastEventTime: now,
        };
      }
      
      return {
        ...state,
        activeEvents: [...state.activeEvents, eventInstance],
        lastEventTime: now,
      };
    }
    
    case 'RESOLVE_EVENT': {
      const eventId = action.payload;
      const updatedEvents = state.activeEvents.filter(event => event.id !== eventId);
      
      return {
        ...state,
        activeEvents: updatedEvents,
      };
    }
    
    case 'PLAY_MINI_GAME': {
      const { gameId, reward } = action.payload;
      const now = Date.now();
      
      const updatedGames = state.miniGames.map(game => {
        if (game.id === gameId) {
          return {
            ...game,
            played: true,
            lastPlayed: now,
          };
        }
        return game;
      });
      
      return {
        ...state,
        miniGames: updatedGames,
        bitcoin: state.bitcoin + reward,
        experience: state.experience + 2,
      };
    }
    
    case 'UPDATE_LEADERBOARD': {
      const playerBitcoinValue = state.bitcoin * BITCOIN_VALUE;
      const playerAssetsValue = state.assets
        .filter(asset => asset.owned)
        .reduce((sum, asset) => sum + asset.price, 0);
      const playerNetWorth = state.cash + playerBitcoinValue + playerAssetsValue;
      
      const playerEntry: LeaderboardEntry = {
        id: 0,
        name: 'You',
        worth: playerNetWorth,
        isPlayer: true,
      };
      
      const nonPlayerEntries = state.leaderboard.filter(entry => !entry.isPlayer);
      
      const combinedEntries = [...nonPlayerEntries, playerEntry]
        .sort((a, b) => b.worth - a.worth);
      
      const playerRank = combinedEntries.findIndex(entry => entry.isPlayer) + 1;
      
      return {
        ...state,
        leaderboard: combinedEntries,
        playerRank,
      };
    }
    
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  sellBitcoin: (amount: number) => void;
  formatBitcoin: (amount: number) => string;
  formatCash: (amount: number) => string;
  triggerRandomEvent: () => void;
  playMiniGame: (gameId: number, reward: number) => void;
  updateLeaderboard: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  sellBitcoin: () => null,
  formatBitcoin: () => '',
  formatCash: () => '',
  triggerRandomEvent: () => null,
  playMiniGame: () => null,
  updateLeaderboard: () => null,
});

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadState = (): GameState => {
    try {
      const savedState = localStorage.getItem('bitcoinMinerGameState');
      return savedState ? JSON.parse(savedState) : initialState;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(gameReducer, loadState());

  useEffect(() => {
    try {
      localStorage.setItem('bitcoinMinerGameState', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'COLLECT_PASSIVE_INCOME' });
      dispatch({ type: 'TRIGGER_RANDOM_EVENT' });
      dispatch({ type: 'UPDATE_LEADERBOARD' });
      
      const now = Date.now();
      state.activeEvents.forEach(event => {
        if (event.duration) {
          const eventStartTime = event.id - event.id % 1000;
          const eventEndTime = eventStartTime + (event.duration * 1000);
          
          if (now >= eventEndTime) {
            dispatch({ type: 'RESOLVE_EVENT', payload: event.id });
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activeEvents]);

  const sellBitcoin = (amount: number) => {
    dispatch({ type: 'SELL_BITCOIN', payload: amount });
  };

  const formatBitcoin = (amount: number) => {
    return amount.toFixed(8);
  };

  const formatCash = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const triggerRandomEvent = () => {
    dispatch({ type: 'TRIGGER_RANDOM_EVENT' });
  };

  const playMiniGame = (gameId: number, reward: number) => {
    dispatch({ type: 'PLAY_MINI_GAME', payload: { gameId, reward } });
  };

  const updateLeaderboard = () => {
    dispatch({ type: 'UPDATE_LEADERBOARD' });
  };

  return (
    <GameContext.Provider value={{ 
      state, 
      dispatch, 
      sellBitcoin, 
      formatBitcoin, 
      formatCash, 
      triggerRandomEvent,
      playMiniGame,
      updateLeaderboard
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
