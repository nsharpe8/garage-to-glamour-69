
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Clock, TrendingUp, TrendingDown, LineChart, Wallet, Coins, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MiniGame as MiniGameType } from '@/types/gameTypes';

interface CryptoTraderGameProps {
  game: MiniGameType;
}

interface PricePoint {
  value: number;
  timestamp: number;
}

const CryptoTraderGame: React.FC<CryptoTraderGameProps> = ({ game }) => {
  const { playMiniGame, formatBitcoin, formatCash, state } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [earnedReward, setEarnedReward] = useState(0);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(30000); // $30,000 starting price
  const [ownedBitcoin, setOwnedBitcoin] = useState(0);
  const [cash, setCash] = useState(10000); // $10,000 starting cash
  const [transactions, setTransactions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60); // 60-second game
  
  const gameIntervalRef = useRef<number | null>(null);
  const priceIntervalRef = useRef<number | null>(null);
  
  const now = Date.now();
  const cooldownEnds = game.lastPlayed + (game.cooldown * 1000);
  const isOnCooldown = now < cooldownEnds;
  const remainingCooldown = Math.ceil((cooldownEnds - now) / 1000);
  
  // Generate new price every second based on volatility
  const updatePrice = () => {
    const volatility = 0.03; // 3% price movement max
    const changePercent = (Math.random() * volatility * 2) - volatility; // Between -3% and +3%
    const newPrice = currentPrice * (1 + changePercent);
    
    setCurrentPrice(Math.max(15000, Math.min(50000, newPrice))); // Price between $15k and $50k
    
    setPrices(prevPrices => [
      ...prevPrices, 
      { value: newPrice, timestamp: Date.now() }
    ].slice(-60)); // Keep last 60 points
  };
  
  // Buying and selling functions
  const buyBitcoin = () => {
    if (cash < currentPrice * 0.01) {
      toast({
        title: "Not enough cash",
        description: "You need at least " + formatCash(currentPrice * 0.01) + " to buy 0.01 BTC",
        variant: "destructive"
      });
      return;
    }
    
    const amount = 0.01; // Buy 0.01 BTC at a time
    const cost = currentPrice * amount;
    
    setCash(prev => prev - cost);
    setOwnedBitcoin(prev => prev + amount);
    
    setTransactions(prev => [
      `Bought ${amount} BTC for ${formatCash(cost)}`,
      ...prev
    ].slice(0, 10));
    
    toast({
      title: "Purchase Successful",
      description: `Bought ${amount} BTC for ${formatCash(cost)}`,
    });
  };
  
  const sellBitcoin = () => {
    if (ownedBitcoin < 0.01) {
      toast({
        title: "Not enough Bitcoin",
        description: "You need at least 0.01 BTC to sell",
        variant: "destructive"
      });
      return;
    }
    
    const amount = 0.01; // Sell 0.01 BTC at a time
    const profit = currentPrice * amount;
    
    setCash(prev => prev + profit);
    setOwnedBitcoin(prev => prev - amount);
    
    setTransactions(prev => [
      `Sold ${amount} BTC for ${formatCash(profit)}`,
      ...prev
    ].slice(0, 10));
    
    toast({
      title: "Sale Successful",
      description: `Sold ${amount} BTC for ${formatCash(profit)}`,
    });
  };
  
  const startGame = () => {
    if (isOnCooldown || isPlaying) return;
    
    setIsPlaying(true);
    setGameCompleted(false);
    setEarnedReward(0);
    setTimeLeft(60);
    setOwnedBitcoin(0);
    setCash(10000);
    setCurrentPrice(30000);
    setPrices([{ value: 30000, timestamp: Date.now() }]);
    setTransactions([]);
    
    // Start price updates
    priceIntervalRef.current = window.setInterval(updatePrice, 1000);
    
    // Start countdown
    gameIntervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    toast({
      title: "Crypto Trading Started",
      description: "Buy low, sell high! You have 60 seconds to make a profit.",
    });
  };
  
  const endGame = () => {
    // Clear intervals
    if (priceIntervalRef.current) {
      clearInterval(priceIntervalRef.current);
      priceIntervalRef.current = null;
    }
    
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    
    // Calculate final portfolio value
    const bitcoinValue = ownedBitcoin * currentPrice;
    const portfolioValue = cash + bitcoinValue;
    
    // Calculate reward
    const profit = portfolioValue - 10000; // How much profit from initial $10k
    const profitPercent = profit / 10000;
    
    // Only reward if they made a profit
    let reward = 0;
    if (profit > 0) {
      const baseBTC = 0.0001;
      const bonusBTC = baseBTC * profitPercent * 10; // Scale by profit percentage
      reward = Math.min(0.001, (baseBTC + bonusBTC) * (1 + (state.level * 0.1)));
      
      setEarnedReward(reward);
      playMiniGame(game.id, reward);
    } else {
      toast({
        title: "Trading Complete",
        description: "You didn't make a profit this time. Try again later!",
      });
    }
    
    setGameCompleted(true);
    
    // End the game after a delay
    setTimeout(() => {
      setIsPlaying(false);
      setGameCompleted(false);
    }, 3000);
  };
  
  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);
  
  // Render price chart as a simple line
  const renderPriceChart = () => {
    if (prices.length < 2) return null;
    
    const chartHeight = 60;
    const chartWidth = 280;
    
    // Find min and max for scaling
    const values = prices.map(p => p.value);
    const min = Math.min(...values) * 0.95;
    const max = Math.max(...values) * 1.05;
    const range = max - min;
    
    // Scale points to chart dimensions
    const points = prices.map((point, i) => {
      const x = (i / (prices.length - 1)) * chartWidth;
      const y = chartHeight - ((point.value - min) / range) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
    
    const isUp = prices[prices.length - 1].value >= prices[prices.length - 2].value;
    
    return (
      <div className="mt-1 mb-3">
        <div className="flex justify-between items-center text-xs">
          <span className="flex items-center">
            {isUp ? (
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
            )}
            {formatCash(currentPrice)}
          </span>
          <span>Time: {timeLeft}s</span>
        </div>
        <div className="relative h-[60px] w-full mt-1">
          <svg width={chartWidth} height={chartHeight} className="absolute top-0 left-0">
            <polyline
              points={points}
              fill="none"
              stroke={isUp ? "#22c55e" : "#ef4444"}
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      {isOnCooldown ? (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Available in {Math.floor(remainingCooldown / 60)}:{(remainingCooldown % 60).toString().padStart(2, '0')}</span>
        </div>
      ) : isPlaying ? (
        <div>
          {gameCompleted ? (
            <div className="text-center py-2">
              <div className="text-green-600 font-medium mb-2">
                {earnedReward > 0 ? (
                  <>You earned {formatBitcoin(earnedReward)} BTC!</>
                ) : (
                  <>Better luck next time!</>
                )}
              </div>
            </div>
          ) : (
            <>
              {renderPriceChart()}
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex items-center text-sm">
                  <Wallet className="w-4 h-4 mr-1 text-gray-700" />
                  {formatCash(cash)}
                </div>
                <div className="flex items-center text-sm">
                  <Coins className="w-4 h-4 mr-1 text-bitcoin" />
                  {formatBitcoin(ownedBitcoin)} BTC
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button 
                  size="sm" 
                  onClick={buyBitcoin} 
                  className="bg-green-500 hover:bg-green-600"
                >
                  Buy 0.01 BTC
                </Button>
                <Button 
                  size="sm" 
                  onClick={sellBitcoin}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={ownedBitcoin < 0.01}
                >
                  Sell 0.01 BTC
                </Button>
              </div>
              
              {transactions.length > 0 && (
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <div className="flex items-center text-xs mb-1">
                    <FileText className="w-3 h-3 mr-1" />
                    <span>Recent Transactions</span>
                  </div>
                  <div className="text-xs space-y-1 max-h-[60px] overflow-y-auto">
                    {transactions.map((tx, i) => (
                      <div key={i} className="text-gray-600">{tx}</div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <button
          onClick={startGame}
          className="w-full py-2 rounded-lg font-medium transition-all bg-bitcoin text-white hover:bg-bitcoin-dark"
        >
          Play Now
        </button>
      )}
    </div>
  );
};

export default CryptoTraderGame;
