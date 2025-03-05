
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Trophy, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  limit?: number;
  showTitle?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  limit = 10,
  showTitle = true
}) => {
  const { state, formatCash } = useGame();
  
  // Only show top entries plus player if they're not in top
  const entries = [...state.leaderboard]
    .slice(0, limit);
  
  // If player is not in the displayed list but exists in full leaderboard, add them
  const playerInDisplayed = entries.some(entry => entry.isPlayer);
  const playerInFull = state.leaderboard.some(entry => entry.isPlayer);
  
  if (!playerInDisplayed && playerInFull) {
    const playerEntry = state.leaderboard.find(entry => entry.isPlayer);
    if (playerEntry) {
      entries.push(playerEntry);
    }
  }
  
  return (
    <div className="glass-panel rounded-xl p-4">
      {showTitle && (
        <div className="flex items-center mb-4">
          <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
          <h2 className="text-lg font-medium">World's Richest People</h2>
        </div>
      )}
      
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div 
            key={entry.id} 
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-all",
              entry.isPlayer 
                ? "bg-bitcoin/10 border border-bitcoin/20" 
                : index < 3 
                  ? "bg-yellow-50/50" 
                  : "bg-white/50"
            )}
          >
            <div className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3",
                index === 0 
                  ? "bg-yellow-400 text-white" 
                  : index === 1 
                    ? "bg-gray-300 text-gray-700"
                    : index === 2 
                      ? "bg-amber-700 text-white" 
                      : "bg-gray-100 text-gray-700"
              )}>
                {state.leaderboard.findIndex(e => e.id === entry.id) + 1}
              </div>
              <div>
                <div className="font-medium flex items-center">
                  {entry.name}
                  {entry.isPlayer && <Star className="w-4 h-4 text-bitcoin ml-1" />}
                </div>
                <div className="text-xs text-gray-500">
                  {formatCash(entry.worth)}
                </div>
              </div>
            </div>
            
            {entry.isPlayer && (
              <div className="text-xs flex items-center">
                {state.playerRank < state.leaderboard.length ? (
                  <><ArrowUp className="w-3 h-3 text-green-500 mr-1" /> Rising</>
                ) : (
                  <><ArrowDown className="w-3 h-3 text-red-500 mr-1" /> Need more assets</>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
