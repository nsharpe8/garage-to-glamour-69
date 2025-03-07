
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Clock, Shield } from 'lucide-react';
import { MiniGame as MiniGameType } from '@/types/gameTypes';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface NetworkDefenseGameProps {
  game: MiniGameType;
}

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}

interface Virus extends Entity {}
interface Bullet extends Entity {}

const NetworkDefenseGame: React.FC<NetworkDefenseGameProps> = ({ game }) => {
  const { playMiniGame, formatBitcoin } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [earnedReward, setEarnedReward] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 0 }); // x, y percentages
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(15); // 15 seconds game
  const [viruses, setViruses] = useState<Virus[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Image references
  const bitcoinImgRef = useRef<HTMLImageElement | null>(null);
  const virusImgRef = useRef<HTMLImageElement | null>(null);
  const bulletImgRef = useRef<HTMLImageElement | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  
  const now = Date.now();
  const cooldownEnds = game.lastPlayed + (game.cooldown * 1000);
  const isOnCooldown = now < cooldownEnds;
  const remainingCooldown = Math.ceil((cooldownEnds - now) / 1000);
  
  // Preload images when component mounts
  useEffect(() => {
    const bitcoinImg = new Image();
    const virusImg = new Image();
    const bulletImg = new Image();
    
    let loadedCount = 0;
    const totalImages = 3;
    
    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
      }
    };
    
    const handleImageError = (e: ErrorEvent) => {
      console.error("Error loading image:", e);
      // Use fallback rendering (the game will use colored shapes instead)
    };
    
    bitcoinImg.onload = handleImageLoad;
    virusImg.onload = handleImageLoad;
    bulletImg.onload = handleImageLoad;
    
    bitcoinImg.onerror = handleImageError as any;
    virusImg.onerror = handleImageError as any;
    bulletImg.onerror = handleImageError as any;
    
    bitcoinImg.src = '/bitcoin.png';
    virusImg.src = '/virus.png';
    bulletImg.src = '/coin.png';
    
    bitcoinImgRef.current = bitcoinImg;
    virusImgRef.current = virusImg;
    bulletImgRef.current = bulletImg;
    
    return () => {
      bitcoinImg.onload = null;
      virusImg.onload = null;
      bulletImg.onload = null;
      bitcoinImg.onerror = null;
      virusImg.onerror = null;
      bulletImg.onerror = null;
    };
  }, []);
  
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const playerWidth = 50;
    const playerHeight = 50;
    const virusWidth = 30;
    const virusHeight = 30;
    const bulletWidth = 15;
    const bulletHeight = 15;
    
    let startTime = Date.now();
    
    const gameLoop = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remainingTime = Math.max(0, gameTime - elapsedSeconds);
      setGameTime(remainingTime);
      
      if (remainingTime <= 0) {
        endGame();
        return;
      }
      
      // Draw game background with gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#1a1a2e');
      bgGradient.addColorStop(1, '#16213e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some "network" grid lines in the background
      ctx.strokeStyle = 'rgba(0, 128, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      const playerX = (playerPosition.x / 100) * (canvas.width - playerWidth);
      const playerY = canvas.height - playerHeight - 10;
      
      // Draw player (Bitcoin)
      if (bitcoinImgRef.current && imagesLoaded) {
        try {
          ctx.drawImage(bitcoinImgRef.current, playerX, playerY, playerWidth, playerHeight);
          // Add glow effect around player
          ctx.shadowColor = '#FFA500';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(playerX + playerWidth / 2, playerY + playerHeight / 2, playerWidth / 2 - 5, 0, Math.PI * 2);
          ctx.closePath();
          ctx.shadowBlur = 0;
        } catch (error) {
          // Fallback rendering
          ctx.fillStyle = '#F7931A';
          ctx.beginPath();
          ctx.arc(playerX + playerWidth / 2, playerY + playerHeight / 2, playerWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Fallback rendering
        ctx.fillStyle = '#F7931A';
        ctx.beginPath();
        ctx.arc(playerX + playerWidth / 2, playerY + playerHeight / 2, playerWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const currentTime = Date.now();
      if (currentTime - lastSpawnRef.current > 800) {
        const newVirus: Virus = {
          x: Math.random() * (canvas.width - virusWidth),
          y: -virusHeight,
          width: virusWidth,
          height: virusHeight,
          speed: 2 + Math.random() * 2,
          active: true
        };
        
        setViruses(prev => [...prev, newVirus]);
        lastSpawnRef.current = currentTime;
      }
      
      setViruses(prev => prev.map(virus => {
        if (!virus.active) return virus;
        
        const newY = virus.y + virus.speed;
        
        if (newY > canvas.height) {
          return {...virus, active: false};
        }
        
        return {...virus, y: newY};
      }).filter(virus => virus.active));
      
      // Draw viruses with glow effect
      viruses.forEach(virus => {
        if (virusImgRef.current && imagesLoaded) {
          try {
            // Add pulsing glow effect to viruses
            const pulseAmount = Math.sin(Date.now() / 200) * 3;
            ctx.shadowColor = 'rgba(255, 0, 255, 0.7)';
            ctx.shadowBlur = 5 + pulseAmount;
            ctx.drawImage(virusImgRef.current, virus.x, virus.y, virus.width, virus.height);
            ctx.shadowBlur = 0;
          } catch (error) {
            // Fallback rendering
            ctx.fillStyle = '#7F00FF';
            ctx.fillRect(virus.x, virus.y, virus.width, virus.height);
          }
        } else {
          // Fallback rendering
          ctx.fillStyle = '#7F00FF';
          ctx.fillRect(virus.x, virus.y, virus.width, virus.height);
        }
      });
      
      setBullets(prev => prev.map(bullet => {
        if (!bullet.active) return bullet;
        
        const newY = bullet.y - bullet.speed;
        
        if (newY < -bulletHeight) {
          return {...bullet, active: false};
        }
        
        return {...bullet, y: newY};
      }).filter(bullet => bullet.active));
      
      // Draw bullets with trail effect
      bullets.forEach(bullet => {
        if (bulletImgRef.current && imagesLoaded) {
          try {
            // Add motion trail
            ctx.globalAlpha = 0.3;
            ctx.drawImage(bulletImgRef.current, bullet.x, bullet.y + 10, bullet.width, bullet.height);
            ctx.globalAlpha = 0.5;
            ctx.drawImage(bulletImgRef.current, bullet.x, bullet.y + 5, bullet.width, bullet.height);
            ctx.globalAlpha = 1.0;
            ctx.drawImage(bulletImgRef.current, bullet.x, bullet.y, bullet.width, bullet.height);
          } catch (error) {
            // Fallback rendering
            ctx.fillStyle = '#F7931A';
            ctx.beginPath();
            ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Fallback rendering
          ctx.fillStyle = '#F7931A';
          ctx.beginPath();
          ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      // Check for collisions
      bullets.forEach(bullet => {
        viruses.forEach(virus => {
          if (bullet.active && virus.active) {
            if (
              bullet.x < virus.x + virus.width &&
              bullet.x + bullet.width > virus.x &&
              bullet.y < virus.y + virus.height &&
              bullet.y + bullet.height > virus.y
            ) {
              bullet.active = false;
              virus.active = false;
              setScore(prev => prev + 10);
              
              // Visual feedback for hit - add explosion effect
              const explosionX = virus.x + virus.width / 2;
              const explosionY = virus.y + virus.height / 2;
              
              ctx.fillStyle = 'rgba(255, 170, 0, 0.7)';
              ctx.beginPath();
              ctx.arc(explosionX, explosionY, 20, 0, Math.PI * 2);
              ctx.fill();
              
              // Update the relevant quest progress
              if (score % 50 === 0) {
                // Only update when actually hitting a milestone to avoid too many updates
                updateVirusHunterQuest();
              }
            }
          }
        });
      });
      
      // Draw HUD
      // Score display with better styling
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Score: ${score}`, 15, 25);
      
      // Timer with visual indicator
      const timerWidth = 100;
      const timerHeight = 10;
      const timerX = canvas.width - timerWidth - 15;
      const timerY = 15;
      
      // Timer background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(timerX, timerY, timerWidth, timerHeight);
      
      // Timer fill - changes color as time runs out
      const timerFillWidth = (remainingTime / gameTime) * timerWidth;
      let timerColor = '#4CAF50'; // Green
      if (remainingTime < 5) timerColor = '#F44336'; // Red when time running out
      else if (remainingTime < 10) timerColor = '#FFC107'; // Yellow when time getting low
      
      ctx.fillStyle = timerColor;
      ctx.fillRect(timerX, timerY, timerFillWidth, timerHeight);
      
      // Timer text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '12px Arial';
      ctx.fillText(`${remainingTime}s`, timerX + timerWidth + 5, timerY + 9);
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, viruses, bullets, playerPosition, score, gameTime, imagesLoaded]);
  
  // Update the quest progress for virus hunting
  const updateVirusHunterQuest = () => {
    const virusHunterQuest = 3; // ID of the virus hunter quest
    const { dispatch } = useGame();
    
    dispatch({ 
      type: 'UPDATE_QUEST_PROGRESS', 
      payload: { 
        id: virusHunterQuest, 
        progress: score / 10 // Each virus is worth 10 points
      } 
    });
  };
  
  // Mouse tracking for player movement
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const percentage = (mouseX / canvas.width) * 100;
      
      // Update player position to follow mouse
      setPlayerPosition(prev => ({
        ...prev,
        x: Math.min(100, Math.max(0, percentage))
      }));
    };
    
    const handleClick = () => {
      fireBullet();
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    // For touch devices
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const percentage = (touchX / canvas.width) * 100;
      
      setPlayerPosition(prev => ({
        ...prev,
        x: Math.min(100, Math.max(0, percentage))
      }));
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      handleTouchMove(e);
    };
    
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isPlaying]);
  
  const fireBullet = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const playerWidth = 50;
    const playerHeight = 50;
    const bulletWidth = 15;
    const bulletHeight = 15;
    
    const playerX = (playerPosition.x / 100) * (canvas.width - playerWidth);
    const playerY = canvas.height - playerHeight - 10;
    
    // Fix projectile alignment to match player position
    const newBullet: Bullet = {
      x: playerX + (playerWidth / 2) - (bulletWidth / 2), // Center the bullet with player
      y: playerY, // Start at top of player
      width: bulletWidth,
      height: bulletHeight,
      speed: 6, // Slightly faster bullet
      active: true
    };
    
    setBullets(prev => [...prev, newBullet]);
    
    // Add sound effect (not implemented but could be a future enhancement)
  };
  
  const startGame = () => {
    if (isOnCooldown || isPlaying) return;
    
    setIsPlaying(true);
    setGameCompleted(false);
    setScore(0);
    setGameTime(15);
    setViruses([]);
    setBullets([]);
    setPlayerPosition({ x: 50, y: 0 });
    
    toast({
      title: "Network Defense",
      description: "Defend your network from viruses!",
    });
    
    // Check for defender achievement if score reaches 500
    if (score >= 500) {
      const { dispatch } = useGame();
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: 3 }); // ID 3 is "Defender" achievement
    }
  };
  
  const endGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    setGameCompleted(true);
    
    const baseBTC = 0.0001;
    const scoreMultiplier = score / 100;
    const reward = baseBTC + (scoreMultiplier * 0.0001);
    
    setEarnedReward(reward);
    playMiniGame(game.id, reward);
    
    toast({
      title: "Game Completed!",
      description: `You scored ${score} points and earned ${formatBitcoin(reward)} BTC!`,
    });
    
    setTimeout(() => {
      setIsPlaying(false);
      setGameCompleted(false);
    }, 3000);
  };
  
  return (
    <div>
      {isOnCooldown ? (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Available in {Math.floor(remainingCooldown / 60)}:{(remainingCooldown % 60).toString().padStart(2, '0')}</span>
        </div>
      ) : isPlaying ? (
        <div className="h-[300px] w-full relative rounded-md overflow-hidden shadow-lg">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full bg-gradient-to-b from-blue-900 to-black"
          />
          
          {gameCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md backdrop-blur-sm">
              <div className="text-center bg-slate-800 p-6 rounded-md shadow-lg border border-yellow-500">
                <div className="text-2xl font-bold text-white mb-2">Game Over!</div>
                <div className="text-yellow-400 text-lg font-medium mb-1">
                  Score: {score}
                </div>
                <div className="text-green-400 font-medium">
                  Reward: {formatBitcoin(earnedReward)} BTC
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-2">
            <Shield className="w-4 h-4 mr-1 text-blue-500" />
            <span className="text-sm text-gray-700">
              Use your mouse to move, click to shoot viruses!
            </span>
          </div>
          <button
            onClick={startGame}
            className="w-full py-2 rounded-lg font-medium transition-all bg-bitcoin text-white hover:bg-bitcoin-dark"
          >
            Play Now
          </button>
        </div>
      )}
    </div>
  );
};

export default NetworkDefenseGame;
