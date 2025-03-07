import { GameState, GameAction, Quest, Achievement } from '../types/gameTypes';
import { calculateTotalHashrate } from '../utils/gameUtils';
import { BITCOIN_VALUE, MINING_RATE, initialRandomEvents } from '../data/gameData';
import { toast } from "@/components/ui/use-toast";

const progressQuest = (quests: Quest[], questId: number, progress: number): Quest[] => {
  return quests.map(quest => {
    if (quest.id === questId) {
      const newProgress = Math.min(quest.target, quest.progress + progress);
      const completed = newProgress >= quest.target;
      
      if (completed && !quest.completed) {
        toast({
          title: "Quest Completed!",
          description: `${quest.name} completed! Claim your reward.`,
        });
      }
      
      return {
        ...quest,
        progress: newProgress,
        completed: completed
      };
    }
    return quest;
  });
};

const checkAchievements = (state: GameState): Achievement[] => {
  return state.achievements.map(achievement => {
    if (achievement.unlocked) return achievement;
    
    let shouldUnlock = false;
    
    switch (achievement.id) {
      case 1: // Welcome to Crypto
        shouldUnlock = true;
        break;
      case 2: // First Million
        const netWorth = calculateNetWorth(state);
        shouldUnlock = netWorth >= 1000000;
        break;
      case 3: // Defender - Score 500 points in Network Defense
        break;
      case 4: // Crypto Empire - Own all mining rigs
        shouldUnlock = state.miningRigs.every(rig => rig.owned);
        break;
      case 5: // Whale Status - Own 1 BTC
        shouldUnlock = state.bitcoin >= 1;
        break;
    }
    
    if (shouldUnlock) {
      toast({
        title: "Achievement Unlocked!",
        description: `${achievement.name}: ${achievement.description}`,
      });
      
      applyAchievementReward(state, achievement);
      
      return { ...achievement, unlocked: true };
    }
    
    return achievement;
  });
};

const calculateNetWorth = (state: GameState): number => {
  const bitcoinValue = state.bitcoin * BITCOIN_VALUE;
  const assetsValue = state.assets
    .filter(asset => asset.owned)
    .reduce((sum, asset) => sum + asset.price, 0);
  return state.cash + bitcoinValue + assetsValue;
};

const applyAchievementReward = (state: GameState, achievement: Achievement) => {
  switch (achievement.reward.type) {
    case 'bitcoin':
      state.bitcoin += achievement.reward.amount;
      break;
    case 'cash':
      state.cash += achievement.reward.amount;
      break;
    case 'experience':
      state.experience += achievement.reward.amount;
      break;
    case 'hashrate':
      state.hashrate += achievement.reward.amount;
      break;
  }
};

const checkDailyQuestReset = (state: GameState): GameState => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (now - state.lastQuestReset > oneDayMs) {
    const resetQuests = state.quests.map(quest => {
      if (quest.category === 'daily') {
        return {
          ...quest,
          progress: 0,
          completed: false,
          claimed: false
        };
      }
      return quest;
    });
    
    toast({
      title: "Daily Quests Reset",
      description: "Your daily quests have been reset. Complete them for rewards!",
    });
    
    return {
      ...state,
      quests: resetQuests,
      lastQuestReset: now
    };
  }
  
  return state;
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  state = checkDailyQuestReset(state);
  
  switch (action.type) {
    case 'MINE_BITCOIN': {
      const now = Date.now();
      const elapsedSeconds = (now - state.lastMined) / 1000;
      const minedBitcoin = state.hashrate * MINING_RATE * elapsedSeconds;
      
      const clickBonus = 0.00002 * state.hashrate;
      const totalMined = minedBitcoin + clickBonus;
      
      let experience = state.experience + 1;
      let level = state.level;
      
      let updatedQuests = progressQuest(state.quests, 1, totalMined);
      updatedQuests = progressQuest(updatedQuests, 5, 1);
      
      if (experience >= state.level * 10) {
        level += 1;
        experience = 0;
        
        const updatedMiniGames = state.miniGames.map(game => {
          if (game.id <= level && !game.unlocked) {
            return { ...game, unlocked: true };
          }
          return game;
        });
        
        toast({
          title: "Level Up!",
          description: `You reached level ${level}!`,
        });
        
        return {
          ...state,
          bitcoin: state.bitcoin + totalMined,
          lastMined: now,
          level,
          experience,
          miniGames: updatedMiniGames,
          quests: updatedQuests,
          achievements: checkAchievements({
            ...state,
            bitcoin: state.bitcoin + totalMined,
            level,
            experience
          })
        };
      }
      
      return {
        ...state,
        bitcoin: state.bitcoin + totalMined,
        lastMined: now,
        level,
        experience,
        quests: updatedQuests,
        achievements: checkAchievements({
          ...state,
          bitcoin: state.bitcoin + totalMined
        })
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
      
      const updatedQuests = progressQuest(state.quests, 4, 1);
      
      const newState = {
        ...state,
        cash: state.cash - rig.price,
        miningRigs: updatedRigs,
        hashrate: calculateTotalHashrate(updatedRigs),
        quests: updatedQuests
      };
      
      return {
        ...newState,
        achievements: checkAchievements(newState)
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
    
    case 'ADD_BITCOIN': {
      const amount = action.payload;
      
      if (amount <= 0) {
        return state;
      }
      
      return {
        ...state,
        bitcoin: state.bitcoin + amount,
      };
    }
    
    case 'COLLECT_PASSIVE_INCOME': {
      const now = Date.now();
      const elapsedSeconds = (now - state.lastMined) / 1000;
      const minedBitcoin = state.hashrate * MINING_RATE * elapsedSeconds;
      
      let experience = state.experience + (elapsedSeconds * 0.01);
      let level = state.level;
      
      if (experience >= state.level * 10) {
        level += 1;
        experience = 0;
        
        const updatedMiniGames = state.miniGames.map(game => {
          if (game.id <= level && !game.unlocked) {
            return { ...game, unlocked: true };
          }
          return game;
        });
        
        toast({
          title: "Level Up!",
          description: `You reached level ${level}!`,
        });
        
        return {
          ...state,
          bitcoin: state.bitcoin + minedBitcoin,
          lastMined: now,
          level,
          experience,
          miniGames: updatedMiniGames
        };
      }
      
      return {
        ...state,
        bitcoin: state.bitcoin + minedBitcoin,
        lastMined: now,
        experience,
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
      
      const game = state.miniGames.find(g => g.id === gameId);
      if (!game || !game.unlocked) {
        return state;
      }
      
      let experience = state.experience + 2;
      let level = state.level;
      
      let updatedQuests = progressQuest(state.quests, 2, 1);
      
      if (gameId === 3) {
        const virusesDestroyed = Math.floor(reward * 1000000 / 2);
        updatedQuests = progressQuest(updatedQuests, 3, virusesDestroyed);
        
        if (virusesDestroyed * 10 >= 500) {
          const updatedAchievements = state.achievements.map(achievement => {
            if (achievement.id === 3 && !achievement.unlocked) {
              toast({
                title: "Achievement Unlocked!",
                description: `${achievement.name}: ${achievement.description}`,
              });
              return { ...achievement, unlocked: true };
            }
            return achievement;
          });
          
          const defenderAchievement = updatedAchievements.find(a => a.id === 3);
          if (defenderAchievement && defenderAchievement.unlocked) {
            return {
              ...state,
              bitcoin: state.bitcoin + defenderAchievement.reward.amount + reward,
              achievements: updatedAchievements,
              quests: updatedQuests
            };
          }
        }
      }
      
      if (experience >= state.level * 10) {
        level += 1;
        experience = 0;
        
        const updatedMiniGames = state.miniGames.map(game => {
          if (game.id <= level && !game.unlocked) {
            return { ...game, unlocked: true };
          }
          return game;
        });
        
        toast({
          title: "Level Up!",
          description: `You reached level ${level}!`,
        });
        
        const finalMiniGames = updatedMiniGames.map(g => {
          if (g.id === gameId) {
            return {
              ...g,
              played: true,
              lastPlayed: now,
            };
          }
          return g;
        });
        
        return {
          ...state,
          miniGames: finalMiniGames,
          bitcoin: state.bitcoin + reward,
          level,
          experience,
          quests: updatedQuests,
          achievements: checkAchievements({
            ...state,
            bitcoin: state.bitcoin + reward,
            level,
            experience
          })
        };
      }
      
      const updatedGames = state.miniGames.map(g => {
        if (g.id === gameId) {
          return {
            ...g,
            played: true,
            lastPlayed: now,
          };
        }
        return g;
      });
      
      toast({
        title: "Mini Game Completed!",
        description: `You earned ${reward.toFixed(8)} BTC!`,
      });
      
      return {
        ...state,
        miniGames: updatedGames,
        bitcoin: state.bitcoin + reward,
        experience,
        quests: updatedQuests,
        achievements: checkAchievements({
          ...state,
          bitcoin: state.bitcoin + reward
        })
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
    
    case 'COMPLETE_QUEST': {
      const questId = action.payload;
      const updatedQuests = state.quests.map(quest => {
        if (quest.id === questId && quest.progress >= quest.target) {
          return { ...quest, completed: true };
        }
        return quest;
      });
      
      return {
        ...state,
        quests: updatedQuests
      };
    }
    
    case 'UPDATE_QUEST_PROGRESS': {
      const { id, progress } = action.payload;
      const updatedQuests = progressQuest(state.quests, id, progress);
      
      return {
        ...state,
        quests: updatedQuests
      };
    }
    
    case 'CLAIM_QUEST_REWARD': {
      const questId = action.payload;
      const quest = state.quests.find(q => q.id === questId);
      
      if (!quest || !quest.completed || quest.claimed) {
        return state;
      }
      
      let updatedState = { ...state };
      
      switch (quest.reward.type) {
        case 'bitcoin':
          updatedState.bitcoin += quest.reward.amount;
          break;
        case 'cash':
          updatedState.cash += quest.reward.amount;
          break;
        case 'experience':
          updatedState.experience += quest.reward.amount;
          if (updatedState.experience >= updatedState.level * 10) {
            updatedState.level += 1;
            updatedState.experience = 0;
            
            toast({
              title: "Level Up!",
              description: `You reached level ${updatedState.level}!`,
            });
            
            updatedState.miniGames = updatedState.miniGames.map(game => {
              if (game.id <= updatedState.level && !game.unlocked) {
                return { ...game, unlocked: true };
              }
              return game;
            });
          }
          break;
      }
      
      updatedState.quests = updatedState.quests.map(q => {
        if (q.id === questId) {
          return { ...q, claimed: true };
        }
        return q;
      });
      
      toast({
        title: "Quest Reward Claimed!",
        description: `You received ${quest.reward.amount} ${quest.reward.type}!`,
      });
      
      updatedState.achievements = checkAchievements(updatedState);
      
      return updatedState;
    }
    
    case 'UNLOCK_ACHIEVEMENT': {
      const achievementId = action.payload;
      const achievement = state.achievements.find(a => a.id === achievementId);
      
      if (!achievement || achievement.unlocked) {
        return state;
      }
      
      let updatedState = { ...state };
      
      switch (achievement.reward.type) {
        case 'bitcoin':
          updatedState.bitcoin += achievement.reward.amount;
          break;
        case 'cash':
          updatedState.cash += achievement.reward.amount;
          break;
        case 'experience':
          updatedState.experience += achievement.reward.amount;
          if (updatedState.experience >= updatedState.level * 10) {
            updatedState.level += 1;
            updatedState.experience = 0;
          }
          break;
        case 'hashrate':
          updatedState.hashrate += achievement.reward.amount;
          break;
      }
      
      updatedState.achievements = updatedState.achievements.map(a => {
        if (a.id === achievementId) {
          return { ...a, unlocked: true };
        }
        return a;
      });
      
      toast({
        title: "Achievement Unlocked!",
        description: `${achievement.name}: ${achievement.description}`,
      });
      
      return updatedState;
    }
    
    case 'RESET_DAILY_QUESTS': {
      const now = Date.now();
      const resetQuests = state.quests.map(quest => {
        if (quest.category === 'daily') {
          return {
            ...quest,
            progress: 0,
            completed: false,
            claimed: false
          };
        }
        return quest;
      });
      
      toast({
        title: "Daily Quests Reset",
        description: "Your daily quests have been reset. Complete them for rewards!",
      });
      
      return {
        ...state,
        quests: resetQuests,
        lastQuestReset: now
      };
    }
    
    default:
      return state;
  }
};

export default gameReducer;
