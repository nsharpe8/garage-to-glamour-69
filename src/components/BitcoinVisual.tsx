
import React, { useRef, useEffect } from 'react';
import { useGame } from '@/context/GameContext';

const BitcoinVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch } = useGame();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let frameId: number;
    let angle = 0;
    
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    const drawBitcoin = (timestamp: number) => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set the center of the canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Calculate size based on canvas dimensions
      const size = Math.min(canvas.width, canvas.height) * 0.4;
      
      // Update the angle
      angle += 0.005;
      
      // Draw the coin
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Draw the coin body
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, '#f7b924');
      gradient.addColorStop(0.8, '#f7931a');
      gradient.addColorStop(1, '#cb7b16');
      
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw the highlight
      ctx.beginPath();
      ctx.arc(-size * 0.2, -size * 0.2, size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      
      // Draw the Bitcoin symbol
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.7}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₿', 0, 0);
      
      // Create a pulsing effect
      const pulseScale = 1 + Math.sin(timestamp * 0.001) * 0.02;
      ctx.scale(pulseScale, pulseScale);
      
      ctx.restore();
      
      // Draw hashrate info
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(`${state.hashrate} H/s`, centerX, centerY + size + 30);
      
      // Draw level info
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(`LEVEL ${state.level}`, centerX, centerY + size + 60);
      
      // Experience bar
      const expBarWidth = 100;
      const expProgress = (state.experience / (state.level * 10)) * expBarWidth;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(centerX - expBarWidth / 2, centerY + size + 70, expBarWidth, 5);
      
      ctx.fillStyle = '#f7931a';
      ctx.fillRect(centerX - expBarWidth / 2, centerY + size + 70, expProgress, 5);
      
      // Request next frame
      frameId = requestAnimationFrame(drawBitcoin);
    };
    
    window.addEventListener('resize', resize);
    resize();
    frameId = requestAnimationFrame(drawBitcoin);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [state.hashrate, state.level, state.experience]);
  
  const handleClick = () => {
    dispatch({ type: 'MINE_BITCOIN' });
  };
  
  return (
    <div className="relative w-full h-64 select-none touch-none my-4">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      />
      <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-gray-500 mt-2">
        Tap the coin to mine Bitcoin
      </div>
    </div>
  );
};

export default BitcoinVisual;
