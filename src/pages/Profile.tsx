
import React from 'react';
import Header from '@/components/Header';
import AssetCard from '@/components/AssetCard';
import GoogleAd from '@/components/GoogleAd';
import Leaderboard from '@/components/Leaderboard';
import { useGame } from '@/context/GameContext';
import { User, ChevronsUp, Trophy, Bitcoin, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { state, formatCash } = useGame();
  
  const ownedAssets = state.assets.filter(asset => asset.owned);
  const ownedAssetsValue = ownedAssets.reduce((total, asset) => total + asset.price, 0);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-page-in">
      <Header />
      
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 mr-2 text-gray-700" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        
        {/* Top ad slot */}
        <div className="mb-6">
          <GoogleAd slot="7890123456" format="rectangle" className="mx-auto max-w-md" />
        </div>
        
        <div className="glass-panel rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bitcoin to-bitcoin-dark flex items-center justify-center text-white text-2xl font-bold">
              {state.level}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">Bitcoin Miner</h2>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <ChevronsUp className="w-4 h-4 mr-1" />
                <span>Level {state.level}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Experience</span>
              <span>{state.experience}/{state.level * 10}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-bitcoin"
                style={{ width: `${(state.experience / (state.level * 10)) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard 
            title="Net Worth"
            value={formatCash(state.cash + ownedAssetsValue)}
            icon={<Trophy className="w-5 h-5 text-yellow-500" />}
            color="yellow"
          />
          <StatCard 
            title="Mining Power"
            value={`${state.hashrate} H/s`}
            icon={<Bitcoin className="w-5 h-5 text-bitcoin" />}
            color="bitcoin"
          />
        </div>

        {/* World Ranking Card */}
        <div className="mb-6 glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="w-5 h-5 text-amber-500 mr-2" />
              <h3 className="font-medium">World Ranking</h3>
            </div>
            <div className="text-xl font-bold">
              #{state.playerRank}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {state.playerRank <= 10 
              ? "You're among the world's wealthiest individuals!"
              : "Keep mining and buying assets to climb the rankings!"
            }
          </div>
        </div>
        
        {/* Leaderboard */}
        <div className="mb-6">
          <Leaderboard />
        </div>
        
        <h2 className="text-lg font-medium mb-4">Your Assets</h2>
        
        {ownedAssets.length > 0 ? (
          <div className="space-y-4 mb-6">
            {ownedAssets.map(asset => (
              <AssetCard key={asset.id} assetId={asset.id} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-6 text-center mb-6">
            <p className="text-gray-500">You don't own any assets yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Visit the store to purchase homes, cars, watches, and vacations.
            </p>
          </div>
        )}
        
        {/* Bottom ad slot */}
        <div className="mt-8">
          <GoogleAd slot="8901234567" format="rectangle" className="mx-auto max-w-md" />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'yellow' | 'bitcoin' | 'blue' | 'green';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'yellow':
        return 'from-yellow-400/10 to-yellow-500/5 border-yellow-500/10';
      case 'bitcoin':
        return 'from-bitcoin/10 to-bitcoin-dark/5 border-bitcoin/10';
      case 'blue':
        return 'from-blue-400/10 to-blue-500/5 border-blue-500/10';
      case 'green':
        return 'from-green-400/10 to-green-500/5 border-green-500/10';
      default:
        return 'from-gray-100 to-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className={cn(
      "glass-panel-sm rounded-xl p-4 bg-gradient-to-b",
      getColorClasses()
    )}>
      <div className="flex items-center mb-2">
        {icon}
        <div className="ml-2 text-sm font-medium text-gray-600">{title}</div>
      </div>
      <div className="font-semibold text-base">{value}</div>
    </div>
  );
};

export default Profile;
