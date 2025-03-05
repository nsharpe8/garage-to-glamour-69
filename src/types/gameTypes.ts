
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

export type GameAction =
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
