
import React from 'react';
import Header from '@/components/Header';
import MiningRig from '@/components/MiningRig';
import { useGame } from '@/context/GameContext';
import { HardDrive } from 'lucide-react';

const Garage = () => {
  const { state } = useGame();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 animate-page-in">
      <Header />
      
      <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center mb-6">
          <HardDrive className="w-6 h-6 mr-2 text-gray-700" />
          <h1 className="text-2xl font-bold">Mining Garage</h1>
        </div>
        
        <div className="glass-panel rounded-xl p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">Your Mining Operation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Hashrate</div>
              <div className="font-semibold">{state.hashrate} H/s</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Rigs</div>
              <div className="font-semibold">
                {state.miningRigs.reduce((total, rig) => total + (rig.owned ? rig.quantity : 0), 0)}
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-lg font-medium mb-4">Available Equipment</h2>
        
        <div className="space-y-4">
          {state.miningRigs.map((rig) => (
            <MiningRig key={rig.id} rigId={rig.id} />
          ))}
        </div>
        
        <div className="mt-8 glass-panel rounded-xl p-4">
          <h3 className="text-lg font-medium mb-2">Mining Tips</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Higher hashrate means faster Bitcoin mining</li>
            <li>• Upgrade your rigs to increase your hashrate</li>
            <li>• You can have multiple of the same rig</li>
            <li>• Mining continues even when you're not active</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Garage;
