
import React, { useState } from 'react';
import Header from '@/components/Header';
import StoreItem from '@/components/StoreItem';
import GoogleAd from '@/components/GoogleAd';
import { useGame } from '@/context/GameContext';
import { ShoppingCart, Home, Car, Watch, Plane, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'all' | 'home' | 'car' | 'watch' | 'vacation' | 'luxury';

const Store = () => {
  const { state } = useGame();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  
  const filteredAssets = state.assets.filter(asset => 
    activeCategory === 'all' || asset.category === activeCategory
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-page-in">
      <Header />
      
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center mb-6">
          <ShoppingCart className="w-6 h-6 mr-2 text-gray-700" />
          <h1 className="text-2xl font-bold">Luxury Store</h1>
        </div>

        {/* Top ad slot - before category tabs */}
        <div className="mb-6">
          <GoogleAd slot="5678901234" format="rectangle" className="mx-auto max-w-md" />
        </div>
        
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <CategoryTab 
              label="All" 
              icon={<ShoppingCart className="w-4 h-4" />} 
              isActive={activeCategory === 'all'} 
              onClick={() => setActiveCategory('all')} 
            />
            <CategoryTab 
              label="Homes" 
              icon={<Home className="w-4 h-4" />} 
              isActive={activeCategory === 'home'} 
              onClick={() => setActiveCategory('home')} 
            />
            <CategoryTab 
              label="Cars" 
              icon={<Car className="w-4 h-4" />} 
              isActive={activeCategory === 'car'} 
              onClick={() => setActiveCategory('car')} 
            />
            <CategoryTab 
              label="Watches" 
              icon={<Watch className="w-4 h-4" />} 
              isActive={activeCategory === 'watch'} 
              onClick={() => setActiveCategory('watch')} 
            />
            <CategoryTab 
              label="Vacations" 
              icon={<Plane className="w-4 h-4" />} 
              isActive={activeCategory === 'vacation'} 
              onClick={() => setActiveCategory('vacation')} 
            />
            <CategoryTab 
              label="Luxury" 
              icon={<Crown className="w-4 h-4" />} 
              isActive={activeCategory === 'luxury'} 
              onClick={() => setActiveCategory('luxury')} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAssets.map((asset) => (
            <StoreItem key={asset.id} assetId={asset.id} />
          ))}
        </div>
        
        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found in this category.</p>
          </div>
        )}
        
        {/* Bottom ad slot - after store items */}
        <div className="mt-8">
          <GoogleAd slot="6789012345" format="rectangle" className="mx-auto max-w-md" />
        </div>
      </div>
    </div>
  );
};

interface CategoryTabProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-1 py-2 px-4 rounded-full whitespace-nowrap transition-all",
        isActive 
          ? "bg-bitcoin text-white" 
          : "bg-white/50 text-gray-600 hover:bg-white"
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default Store;
