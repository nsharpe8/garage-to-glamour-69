
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BitcoinVisual from '@/components/BitcoinVisual';
import { useGame } from '@/context/GameContext';
import { HardDrive, Wallet, ChevronsUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const BITCOIN_PRICE = 30000; // $30,000 per BTC

const Index = () => {
  const { state, dispatch, formatBitcoin, formatCash } = useGame();
  const navigate = useNavigate();

  // Display welcome modal for first-time visitors
  useEffect(() => {
    if (state.isFirstVisit) {
      // Could add a welcome modal here
      setTimeout(() => {
        dispatch({ type: 'DISMISS_FIRST_VISIT' });
      }, 5000);
    }
  }, [state.isFirstVisit, dispatch]);

  const handleSellBitcoin = () => {
    if (state.bitcoin > 0) {
      dispatch({ type: 'SELL_BITCOIN', payload: state.bitcoin });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-page-in">
      <Header />

      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-1">Bitcoin Miner</h1>
          <p className="text-gray-600">From Garage to Glamour</p>
        </div>

        <BitcoinVisual />

        <div className="mt-8 space-y-4">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-bitcoin/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-bitcoin" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">Bitcoin Balance</h3>
                  <p className="text-sm text-gray-500">Current value</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatBitcoin(state.bitcoin)} BTC</div>
                <div className="text-sm text-gray-500">
                  ≈ {formatCash(state.bitcoin * BITCOIN_PRICE)}
                </div>
              </div>
            </div>

            <button
              onClick={handleSellBitcoin}
              disabled={state.bitcoin <= 0}
              className={cn(
                "w-full mt-4 py-2 rounded-lg font-medium transition-all",
                state.bitcoin > 0
                  ? "bg-bitcoin text-white hover:bg-bitcoin-dark"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              Sell All Bitcoin
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title="Mining Power"
              value={`${state.hashrate} H/s`}
              icon={<HardDrive className="w-5 h-5 text-blue-500" />}
              onClick={() => navigate('/garage')}
              color="blue"
            />
            
            <StatsCard
              title="Level"
              value={`Level ${state.level}`}
              icon={<ChevronsUp className="w-5 h-5 text-purple-500" />}
              color="purple"
              subtext={`${state.experience}/${state.level * 10} XP`}
            />
          </div>

          <button
            onClick={() => navigate('/store')}
            className="w-full glass-panel-sm rounded-xl py-3 px-4 flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div className="font-medium">Browse Store</div>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
  subtext?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  subtext,
  onClick,
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-500/10 to-blue-600/5 border-blue-500/10';
      case 'green':
        return 'from-green-500/10 to-green-600/5 border-green-500/10';
      case 'purple':
        return 'from-purple-500/10 to-purple-600/5 border-purple-500/10';
      case 'red':
        return 'from-red-500/10 to-red-600/5 border-red-500/10';
      default:
        return 'from-gray-100 to-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={cn(
        "glass-panel-sm rounded-xl p-4 bg-gradient-to-b transition-all",
        getColorClass(),
        onClick ? "cursor-pointer hover:shadow-lg" : ""
      )}
      onClick={onClick}
    >
      <div className="flex items-center mb-2">
        {icon}
        <div className="ml-2 text-sm font-medium text-gray-600">{title}</div>
      </div>
      <div className="font-semibold text-lg">{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );
};

export default Index;
