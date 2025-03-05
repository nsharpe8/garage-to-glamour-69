
import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
  category: 'home' | 'car' | 'watch' | 'vacation';
  price: number;
  image: string;
  owned: boolean;
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
}

type GameAction =
  | { type: 'MINE_BITCOIN' }
  | { type: 'BUY_RIG'; payload: number }
  | { type: 'SELL_RIG'; payload: number }
  | { type: 'UPGRADE_RIG'; payload: number }
  | { type: 'BUY_ASSET'; payload: number }
  | { type: 'SELL_BITCOIN'; payload: number }
  | { type: 'COLLECT_PASSIVE_INCOME' }
  | { type: 'DISMISS_FIRST_VISIT' };

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
      
      // Level up if enough experience
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
        cash: state.cash + (rig.price * 0.5), // Sell for half price
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
        experience: state.experience + 5, // Bonus experience for buying assets
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
    
    default:
      return state;
  }
};

// Create the context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  sellBitcoin: (amount: number) => void;
  formatBitcoin: (amount: number) => string;
  formatCash: (amount: number) => string;
}>({
  state: initialState,
  dispatch: () => null,
  sellBitcoin: () => null,
  formatBitcoin: () => '',
  formatCash: () => '',
});

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load state from localStorage
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bitcoinMinerGameState', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [state]);

  // Passive mining when app is open
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'COLLECT_PASSIVE_INCOME' });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper functions
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

  return (
    <GameContext.Provider value={{ state, dispatch, sellBitcoin, formatBitcoin, formatCash }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
