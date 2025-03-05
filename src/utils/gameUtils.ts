
import { MiningRig } from '../types/gameTypes';
import { BITCOIN_VALUE } from '../data/gameData';

export const calculateTotalHashrate = (rigs: MiningRig[]): number => {
  return rigs.reduce((total, rig) => {
    return total + (rig.owned ? rig.hashrate * rig.quantity : 0);
  }, 0);
};

export const formatBitcoin = (amount: number): string => {
  return amount.toFixed(8);
};

export const formatCash = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
