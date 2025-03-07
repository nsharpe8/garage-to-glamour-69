
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
    let particles: Particle[] = [];
    
    // Create particle class for visual effects
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor(x: number, y: number, size: number, speedX: number, speedY: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.size > 0.2) this.size -= 0.1;
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    // Get color based on hashrate - more dynamic colors for higher hashrates
    const getHashrateColor = () => {
      if (state.hashrate < 10) return '#f7931a'; // Default bitcoin orange
      if (state.hashrate < 50) return '#3490dc'; // Blue
      if (state.hashrate < 200) return '#8B5CF6'; // Purple
      if (state.hashrate < 500) return '#D946EF'; // Magenta
      return '#F97316'; // Bright orange for high hashrates
    };
    
    // Get particle count based on hashrate - more particles for higher hashrates
    const getParticleCount = () => {
      return Math.min(Math.floor(state.hashrate / 1.5), 75); // Increased max particles
    };
    
    // Create particle effect with more particles and colors
    const createParticles = (x: number, y: number, count: number) => {
      const colors = ['#f7931a', '#f0ad4e', '#ffc107', '#fd7e14', '#ffeb3b'];
      
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 5 + 1; // Slightly larger particles
        const speedX = (Math.random() - 0.5) * 4; // Faster movement
        const speedY = (Math.random() - 0.5) * 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, size, speedX, speedY, color));
      }
    };
    
    const drawBitcoin = (timestamp: number) => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set the center of the canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Calculate size based on canvas dimensions and hashrate
      const baseSize = Math.min(canvas.width, canvas.height) * 0.4;
      const sizeBoost = Math.min(state.hashrate / 100, 0.15); // Up to 15% larger based on hashrate (increased from 10%)
      const size = baseSize * (1 + sizeBoost);
      
      // Update the angle - rotate faster with higher hashrate
      const rotationSpeed = 0.005 * (1 + Math.min(state.hashrate / 200, 0.7)); // Increased max rotation speed
      angle += rotationSpeed;
      
      // Add more particles for higher hashrates
      if (Math.random() < 0.2 && state.hashrate > 10) {
        const particleCount = Math.floor(Math.random() * getParticleCount());
        const angle = Math.random() * Math.PI * 2;
        const distance = size * 0.8;
        const particleX = centerX + Math.cos(angle) * distance;
        const particleY = centerY + Math.sin(angle) * distance;
        createParticles(particleX, particleY, particleCount);
      }
      
      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw(ctx);
        
        // Remove particles that are too small
        if (particle.size <= 0.2) {
          particles.splice(index, 1);
        }
      });
      
      // Draw the coin
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      // Draw the coin body with a more dynamic gradient based on hashrate
      const mainColor = getHashrateColor();
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      gradient.addColorStop(0, '#fff6e0');
      gradient.addColorStop(0.5, mainColor);
      gradient.addColorStop(1, '#cb7b16');
      
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add a gold rim effect
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.lineWidth = size * 0.05;
      ctx.strokeStyle = '#e6a932';
      ctx.stroke();
      
      // Draw the highlight - more prominent with higher hashrates
      ctx.beginPath();
      ctx.arc(-size * 0.2, -size * 0.2, size * 0.8, 0, Math.PI * 2);
      const highlightOpacity = 0.1 + Math.min(state.hashrate / 400, 0.15); // More shine with higher hashrate (increased from 0.1)
      ctx.fillStyle = `rgba(255, 255, 255, ${highlightOpacity})`;
      ctx.fill();
      
      // Draw the Bitcoin symbol
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.7}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₿', 0, 0);
      
      // Create a pulsing effect - more intense with higher hashrates
      const pulseIntensity = 0.02 + Math.min(state.hashrate / 800, 0.05); // Increased from 0.03
      const pulseScale = 1 + Math.sin(timestamp * 0.001) * pulseIntensity;
      ctx.scale(pulseScale, pulseScale);
      
      ctx.restore();
      
      // Draw hashrate info with color coding based on value
      ctx.font = 'bold 16px Inter, sans-serif';
      const hashrateColor = getHashrateColor();
      ctx.fillStyle = hashrateColor;
      ctx.textAlign = 'center';
      
      // Make hashrate display more visually impressive with enhanced animations
      const hashrateText = `${state.hashrate} H/s`;
      
      // Add a subtle glow effect for higher hashrates
      if (state.hashrate > 10) {
        ctx.shadowColor = hashrateColor;
        ctx.shadowBlur = Math.min(state.hashrate / 8, 15); // Increased glow for higher hashrates
        ctx.fillText(hashrateText, centerX, centerY + size + 30);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillText(hashrateText, centerX, centerY + size + 30);
      }
      
      // Draw level info with better visuals
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(`LEVEL ${state.level}`, centerX, centerY + size + 60);
      
      // Experience bar with enhanced visuals
      const expBarWidth = 120;
      const expBarHeight = 6;
      const expProgress = (state.experience / (state.level * 10)) * expBarWidth;
      
      // Draw background of exp bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(centerX - expBarWidth / 2, centerY + size + 70, expBarWidth, expBarHeight);
      
      // Draw progress with gradient
      const expGradient = ctx.createLinearGradient(
        centerX - expBarWidth / 2, 
        0, 
        centerX - expBarWidth / 2 + expProgress, 
        0
      );
      expGradient.addColorStop(0, '#f7931a');
      expGradient.addColorStop(1, '#ffc107');
      
      ctx.fillStyle = expGradient;
      ctx.fillRect(centerX - expBarWidth / 2, centerY + size + 70, expProgress, expBarHeight);
      
      // Draw exp bar border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(centerX - expBarWidth / 2, centerY + size + 70, expBarWidth, expBarHeight);
      
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    dispatch({ type: 'MINE_BITCOIN' });
    
    // Add enhanced visual feedback on click
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create ripple effect at click location
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Create a more dramatic ripple circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(247, 147, 26, 0.4)';
      ctx.fill();
      
      // Add particle burst on click for better feedback
      const particleCount = Math.min(20 + Math.floor(state.hashrate / 5), 50);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const distance = 30 + Math.random() * 20;
        
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 rounded-full bg-bitcoin animate-fade-out';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        canvas.parentElement?.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
          particle.remove();
        }, 1000);
      }
      
      // Fade out ripple after animation
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 150);
    }
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
