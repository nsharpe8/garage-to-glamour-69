import { MiningRig, Asset, LeaderboardEntry, RandomEvent, MiniGame, GameState, Quest, Achievement } from '../types/gameTypes';

export const BITCOIN_VALUE = 30000; // $30,000 per BTC
export const MINING_RATE = 0.00002; // Doubled from 0.00001 - BTC per hashrate per second

export const initialRigs: MiningRig[] = [
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

export const initialAssets: Asset[] = [
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

export const initialRandomEvents: RandomEvent[] = [
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

export const initialMiniGames: MiniGame[] = [
  {
    id: 1,
    name: 'Hash Puzzle',
    description: 'Solve a puzzle to earn Bitcoin.',
    unlocked: true, // First game is unlocked by default
    played: false,
    cooldown: 60, // 1 minute for testing (was 300)
    lastPlayed: 0,
  },
  {
    id: 2,
    name: 'Crypto Trader',
    description: 'Test your trading skills to earn cash.',
    unlocked: false, // Unlocks at level 3
    played: false,
    cooldown: 120, // 2 minutes for testing (was 600)
    lastPlayed: 0,
  },
  {
    id: 3,
    name: 'Network Defense',
    description: 'Defend your mining operation from hackers.',
    unlocked: false, // Unlocks at level 5
    played: false,
    cooldown: 180, // 3 minutes for testing (was 900)
    lastPlayed: 0,
  },
];

export const initialLeaderboard: LeaderboardEntry[] = [
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

export const initialQuests: Quest[] = [
  {
    id: 1,
    name: "First Steps",
    description: "Mine your first 0.001 BTC",
    completed: false,
    claimed: false,
    reward: {
      type: "bitcoin",
      amount: 0.0005
    },
    progress: 0,
    target: 0.001,
    category: "mining"
  },
  {
    id: 2,
    name: "Game Master",
    description: "Play all mini-games at least once",
    completed: false,
    claimed: false,
    reward: {
      type: "experience",
      amount: 10
    },
    progress: 0,
    target: 3,
    category: "games"
  },
  {
    id: 3,
    name: "Virus Hunter",
    description: "Destroy 50 viruses in Network Defense",
    completed: false,
    claimed: false,
    reward: {
      type: "bitcoin",
      amount: 0.001
    },
    progress: 0,
    target: 50,
    category: "games"
  },
  {
    id: 4,
    name: "Rookie Investor",
    description: "Buy your first mining rig",
    completed: false,
    claimed: false,
    reward: {
      type: "cash",
      amount: 1000
    },
    progress: 0,
    target: 1,
    category: "collection"
  },
  {
    id: 5,
    name: "Daily Mining",
    description: "Mine BTC 5 times today",
    completed: false,
    claimed: false,
    reward: {
      type: "bitcoin",
      amount: 0.0008
    },
    progress: 0,
    target: 5,
    category: "daily"
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 1,
    name: "Welcome to Crypto",
    description: "Start your Bitcoin mining journey",
    unlocked: false,
    reward: {
      type: "experience",
      amount: 5
    },
    icon: "🎉",
    rarity: "common"
  },
  {
    id: 2,
    name: "First Million",
    description: "Reach $1,000,000 net worth",
    unlocked: false,
    reward: {
      type: "hashrate",
      amount: 10
    },
    icon: "💰",
    rarity: "rare"
  },
  {
    id: 3,
    name: "Defender",
    description: "Score 500 points in Network Defense",
    unlocked: false,
    reward: {
      type: "bitcoin",
      amount: 0.01
    },
    icon: "🛡️",
    rarity: "uncommon"
  },
  {
    id: 4,
    name: "Crypto Empire",
    description: "Own all mining rigs",
    unlocked: false,
    reward: {
      type: "hashrate",
      amount: 20
    },
    icon: "🏭",
    rarity: "epic"
  },
  {
    id: 5,
    name: "Whale Status",
    description: "Own 1 BTC",
    unlocked: false,
    reward: {
      type: "cash",
      amount: 10000
    },
    icon: "🐋",
    rarity: "legendary"
  }
];

export const initialState: GameState = {
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
  quests: initialQuests,
  achievements: initialAchievements,
  lastQuestReset: Date.now()
};
