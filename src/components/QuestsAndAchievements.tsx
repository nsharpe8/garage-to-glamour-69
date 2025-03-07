
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle, Target, Clock } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';

const QuestsAndAchievements = () => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<string>('quests');
  
  const claimQuestReward = (questId: number) => {
    dispatch({ 
      type: 'CLAIM_QUEST_REWARD', 
      payload: questId 
    });
    
    toast({
      title: "Reward Claimed",
      description: "You've claimed your quest reward!",
    });
  };
  
  // Group quests by category
  const questsByCategory = {
    daily: state.quests.filter(q => q.category === 'daily'),
    mining: state.quests.filter(q => q.category === 'mining'),
    games: state.quests.filter(q => q.category === 'games'),
    collection: state.quests.filter(q => q.category === 'collection'),
  };
  
  // Group achievements by rarity
  const achievementsByRarity = {
    common: state.achievements.filter(a => a.rarity === 'common'),
    uncommon: state.achievements.filter(a => a.rarity === 'uncommon'),
    rare: state.achievements.filter(a => a.rarity === 'rare'),
    epic: state.achievements.filter(a => a.rarity === 'epic'),
    legendary: state.achievements.filter(a => a.rarity === 'legendary'),
  };
  
  const getBgColorByRarity = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'uncommon': return 'bg-green-100';
      case 'rare': return 'bg-blue-100';
      case 'epic': return 'bg-purple-100';
      case 'legendary': return 'bg-amber-100';
      default: return 'bg-gray-100';
    }
  };
  
  const getTextColorByRarity = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-700';
      case 'uncommon': return 'text-green-700';
      case 'rare': return 'text-blue-700';
      case 'epic': return 'text-purple-700';
      case 'legendary': return 'text-amber-700';
      default: return 'text-gray-700';
    }
  };
  
  const getRewardTypeText = (type: string) => {
    switch (type) {
      case 'bitcoin': return 'BTC';
      case 'cash': return '$';
      case 'experience': return 'XP';
      case 'hashrate': return 'H/s';
      default: return '';
    }
  };
  
  return (
    <Tabs 
      defaultValue="quests" 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="quests" className="flex items-center gap-1">
          <Target className="w-4 h-4" />
          <span>Quests</span>
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          <span>Achievements</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="quests" className="space-y-4 mt-2">
        {/* Daily Quests */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 mr-1 text-blue-500" />
            <h3 className="text-sm font-medium">Daily Quests</h3>
          </div>
          
          <div className="space-y-2">
            {questsByCategory.daily.map(quest => (
              <QuestItem 
                key={quest.id} 
                quest={quest} 
                onClaim={() => claimQuestReward(quest.id)} 
              />
            ))}
          </div>
        </div>
        
        {/* Regular Quests */}
        <div>
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 mr-1 text-green-500" />
            <h3 className="text-sm font-medium">Quests</h3>
          </div>
          
          <div className="space-y-2">
            {[...questsByCategory.mining, ...questsByCategory.games, ...questsByCategory.collection].map(quest => (
              <QuestItem 
                key={quest.id} 
                quest={quest} 
                onClaim={() => claimQuestReward(quest.id)} 
              />
            ))}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="achievements" className="space-y-4 mt-2">
        {Object.entries(achievementsByRarity).map(([rarity, achievements]) => (
          achievements.length > 0 && (
            <div key={rarity} className="mb-4">
              <h3 className="text-sm font-medium capitalize mb-2">{rarity} Achievements</h3>
              
              <div className="space-y-2">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={cn(
                      "p-3 rounded-lg relative overflow-hidden", 
                      achievement.unlocked 
                        ? getBgColorByRarity(achievement.rarity) 
                        : "bg-gray-100 opacity-70"
                    )}
                  >
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "font-medium",
                            achievement.unlocked ? getTextColorByRarity(achievement.rarity) : "text-gray-500"
                          )}>
                            {achievement.name}
                          </h4>
                          {achievement.unlocked && (
                            <span className="text-xs bg-white bg-opacity-50 px-2 py-0.5 rounded-full">
                              +{achievement.reward.amount} {getRewardTypeText(achievement.reward.type)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </TabsContent>
    </Tabs>
  );
};

interface QuestItemProps {
  quest: {
    id: number;
    name: string;
    description: string;
    completed: boolean;
    claimed: boolean;
    reward: {
      type: string;
      amount: number;
    };
    progress: number;
    target: number;
  };
  onClaim: () => void;
}

const QuestItem: React.FC<QuestItemProps> = ({ quest, onClaim }) => {
  const progressPercent = Math.min(100, Math.floor((quest.progress / quest.target) * 100));
  
  return (
    <div className="p-3 rounded-lg bg-white shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm flex items-center">
            {quest.name}
            {quest.completed && <CheckCircle className="w-3 h-3 ml-1 text-green-500" />}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">{quest.description}</p>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{quest.progress} / {quest.target}</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </div>
        
        <div className="ml-4 flex flex-col items-end">
          <div className="text-xs bg-gray-100 px-2 py-1 rounded-full mb-2">
            +{quest.reward.amount} {getRewardTypeText(quest.reward.type)}
          </div>
          
          {quest.completed && !quest.claimed ? (
            <button
              onClick={onClaim}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition-colors"
            >
              Claim
            </button>
          ) : quest.claimed ? (
            <span className="text-xs text-gray-400">Claimed</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

function getRewardTypeText(type: string) {
  switch (type) {
    case 'bitcoin': return 'BTC';
    case 'cash': return '$';
    case 'experience': return 'XP';
    default: return type;
  }
}

export default QuestsAndAchievements;
