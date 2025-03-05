
import { MiningRig, Asset, LeaderboardEntry, RandomEvent, MiniGame, GameState } from '../types/gameTypes';

export const BITCOIN_VALUE = 30000; // $30,000 per BTC
export const MINING_RATE = 0.00001; // BTC per hashrate per second

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
};
