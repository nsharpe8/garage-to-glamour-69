
export interface Quest {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  reward: {
    type: 'bitcoin' | 'cash' | 'experience';
    amount: number;
  };
  progress: number;
  target: number;
  category: 'mining' | 'games' | 'collection' | 'daily';
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  unlocked: boolean;
  reward: {
    type: 'bitcoin' | 'cash' | 'experience' | 'hashrate';
    amount: number;
  };
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export type QuestAction = 
  | { type: 'COMPLETE_QUEST'; payload: number }
  | { type: 'UPDATE_QUEST_PROGRESS'; payload: { id: number; progress: number } }
  | { type: 'CLAIM_QUEST_REWARD'; payload: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: number }
  | { type: 'RESET_DAILY_QUESTS' };
