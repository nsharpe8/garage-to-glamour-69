
import { GameState, GameAction } from '../types/gameTypes';
import { calculateTotalHashrate } from '../utils/gameUtils';
import { BITCOIN_VALUE, MINING_RATE, initialRandomEvents } from '../data/gameData';
import { toast } from "@/components/ui/use-toast";

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
      
      const playerEntry = {
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

export default gameReducer;
