
import React from 'react';
import { useGame } from '@/context/GameContext';
import { HardDrive, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MiningRigProps {
  rigId: number;
}

const MiningRig: React.FC<MiningRigProps> = ({ rigId }) => {
  const { state, dispatch, formatCash } = useGame();
  const rig = state.miningRigs.find(r => r.id === rigId);
  
  if (!rig) return null;
  
  const canBuy = state.cash >= rig.price;
  const canSell = rig.owned && rig.quantity > 0;
  
  const handleBuy = () => {
    if (canBuy) {
      dispatch({ type: 'BUY_RIG', payload: rigId });
    }
  };
  
  const handleSell = () => {
    if (canSell) {
      dispatch({ type: 'SELL_RIG', payload: rigId });
    }
  };
  
  const getHashrateColor = (hashrate: number) => {
    if (hashrate < 5) return 'text-gray-600';
    if (hashrate < 25) return 'text-blue-600';
    if (hashrate < 100) return 'text-purple-600';
    return 'text-bitcoin';
  };
  
  return (
    <div className={cn(
      "glass-panel rounded-xl p-4 transition-all duration-300 overflow-hidden",
      rig.owned ? "border-bitcoin/30" : "border-gray-200"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            rig.owned ? "bg-bitcoin/10" : "bg-gray-100"
          )}>
            <HardDrive className={cn(
              "w-5 h-5",
              rig.owned ? "text-bitcoin" : "text-gray-400"
            )} />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-base">{rig.name}</h3>
            <div className="flex space-x-4 text-xs mt-1">
              <span className={cn("font-semibold", getHashrateColor(rig.hashrate))}>
                {rig.hashrate} H/s
              </span>
              <span className="text-gray-500">
                {rig.power}W
              </span>
            </div>
          </div>
        </div>
        
        {rig.owned && (
          <div className="text-lg font-semibold">
            x{rig.quantity}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="font-semibold">
          {formatCash(rig.price)}
        </div>
        
        <div className="flex space-x-2">
          {rig.owned && (
            <button
              onClick={handleSell}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              disabled={!canSell}
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleBuy}
            className={cn(
              "p-2 rounded-lg transition-colors",
              canBuy 
                ? "bg-bitcoin/10 text-bitcoin hover:bg-bitcoin/20" 
                : "bg-gray-100 text-gray-400"
            )}
            disabled={!canBuy}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiningRig;
