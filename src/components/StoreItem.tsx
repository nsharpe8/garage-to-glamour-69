
import React from 'react';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';
import { Car, Home, Watch, Plane, Crown } from 'lucide-react';

interface StoreItemProps {
  assetId: number;
}

const StoreItem: React.FC<StoreItemProps> = ({ assetId }) => {
  const { state, dispatch, formatCash } = useGame();
  const asset = state.assets.find(a => a.id === assetId);
  
  if (!asset) return null;
  
  const canBuy = !asset.owned && state.cash >= asset.price;
  
  const handleBuy = () => {
    if (canBuy) {
      dispatch({ type: 'BUY_ASSET', payload: assetId });
    }
  };
  
  const getCategoryIcon = () => {
    switch (asset.category) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'watch':
        return <Watch className="w-5 h-5" />;
      case 'vacation':
        return <Plane className="w-5 h-5" />;
      case 'luxury':
        return <Crown className="w-5 h-5" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={cn(
      "glass-panel rounded-xl overflow-hidden transition-all duration-300",
      asset.owned ? "border-green-400/30" : "border-white/10"
    )}>
      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          asset.owned ? "bg-green-400" : "bg-gray-300"
        )}>
          {getCategoryIcon()}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{asset.name}</h3>
          <div className={cn(
            "text-xs px-2 py-1 rounded-full",
            asset.owned 
              ? "bg-green-400/10 text-green-600" 
              : "bg-gray-100 text-gray-600"
          )}>
            {asset.owned ? 'Owned' : asset.category}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="font-semibold">
            {formatCash(asset.price)}
          </div>
          
          <button
            onClick={handleBuy}
            disabled={!canBuy || asset.owned}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300",
              asset.owned 
                ? "bg-green-400/10 text-green-600" 
                : canBuy 
                  ? "bg-bitcoin hover:bg-bitcoin-dark text-white" 
                  : "bg-gray-100 text-gray-400"
            )}
          >
            {asset.owned ? 'Owned' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreItem;
