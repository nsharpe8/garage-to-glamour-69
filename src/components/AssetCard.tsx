
import React from 'react';
import { Car, Home, Watch, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';

interface AssetCardProps {
  assetId: number;
}

const AssetCard: React.FC<AssetCardProps> = ({ assetId }) => {
  const { state, formatCash } = useGame();
  const asset = state.assets.find(a => a.id === assetId);
  
  if (!asset || !asset.owned) return null;
  
  const getCategoryIcon = () => {
    switch (asset.category) {
      case 'home':
        return <Home className="w-6 h-6" />;
      case 'car':
        return <Car className="w-6 h-6" />;
      case 'watch':
        return <Watch className="w-6 h-6" />;
      case 'vacation':
        return <Plane className="w-6 h-6" />;
      default:
        return null;
    }
  };
  
  const getCategoryColor = () => {
    switch (asset.category) {
      case 'home':
        return 'from-blue-400/20 to-blue-600/20 text-blue-600';
      case 'car':
        return 'from-red-400/20 to-red-600/20 text-red-600';
      case 'watch':
        return 'from-purple-400/20 to-purple-600/20 text-purple-600';
      case 'vacation':
        return 'from-green-400/20 to-green-600/20 text-green-600';
      default:
        return 'from-gray-200 to-gray-300 text-gray-600';
    }
  };
  
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className={cn(
        "h-24 bg-gradient-to-r flex items-center p-4",
        getCategoryColor()
      )}>
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {getCategoryIcon()}
        </div>
        <div className="ml-4">
          <h3 className="font-medium text-lg">{asset.name}</h3>
          <p className="opacity-80 text-sm">{formatCash(asset.price)}</p>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
