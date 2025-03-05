
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, HardDrive, ShoppingCart, User, Bitcoin } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { cn } from '@/lib/utils';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, formatBitcoin, formatCash } = useGame();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/5 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center space-x-2">
            <Bitcoin className="h-5 w-5 text-bitcoin animate-pulse" />
            <span className="font-semibold text-sm">{formatBitcoin(state.bitcoin)} BTC</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">{formatCash(state.cash)}</span>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg border-t border-white/10 bg-black/5">
        <div className="flex justify-around items-center h-16 px-6 max-w-screen-xl mx-auto">
          <NavButton 
            icon={<Home className="h-5 w-5" />} 
            label="Home" 
            isActive={isActive('/')} 
            onClick={() => navigate('/')} 
          />
          <NavButton 
            icon={<HardDrive className="h-5 w-5" />} 
            label="Garage" 
            isActive={isActive('/garage')} 
            onClick={() => navigate('/garage')} 
          />
          <NavButton 
            icon={<ShoppingCart className="h-5 w-5" />} 
            label="Store" 
            isActive={isActive('/store')} 
            onClick={() => navigate('/store')} 
          />
          <NavButton 
            icon={<User className="h-5 w-5" />} 
            label="Profile" 
            isActive={isActive('/profile')} 
            onClick={() => navigate('/profile')} 
          />
        </div>
      </div>
      
      <div className="pb-16 pt-14">
        {/* Content spacing for fixed header and footer */}
      </div>
    </>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-16 py-1 transition-all duration-300 rounded-lg",
        isActive 
          ? "text-bitcoin" 
          : "text-gray-500 hover:text-gray-800"
      )}
    >
      <div className={cn(
        "transition-transform duration-300",
        isActive ? "scale-110" : ""
      )}>
        {icon}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
      {isActive && (
        <div className="h-1 w-4 bg-bitcoin rounded-full mt-1" />
      )}
    </button>
  );
};

export default Header;
