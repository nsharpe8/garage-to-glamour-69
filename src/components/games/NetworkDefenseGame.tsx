
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
  const [playerPosition, setPlayerPosition] = useState(50); // percentage across screen
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
      
      // Background
      ctx.fillStyle = '#F8F9FA';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const playerX = (playerPosition / 100) * (canvas.width - playerWidth);
      const playerY = canvas.height - playerHeight - 10;
      
      // Draw player (Bitcoin)
      if (bitcoinImgRef.current && imagesLoaded) {
        try {
          ctx.drawImage(bitcoinImgRef.current, playerX, playerY, playerWidth, playerHeight);
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
      
      // Draw viruses
      viruses.forEach(virus => {
        if (virusImgRef.current && imagesLoaded) {
          try {
            ctx.drawImage(virusImgRef.current, virus.x, virus.y, virus.width, virus.height);
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
      
      // Draw bullets
      bullets.forEach(bullet => {
        if (bulletImgRef.current && imagesLoaded) {
          try {
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
            }
          }
        });
      });
      
      // Draw HUD
      ctx.fillStyle = '#333';
      ctx.font = '16px Arial';
      ctx.fillText(`Score: ${score}`, 10, 25);
      ctx.fillText(`Time: ${remainingTime}s`, canvas.width - 100, 25);
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, viruses, bullets, playerPosition, score, gameTime, imagesLoaded]);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPlayerPosition(prev => Math.max(0, prev - 5));
      } else if (e.key === 'ArrowRight') {
        setPlayerPosition(prev => Math.min(100, prev + 5));
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        fireBullet();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying]);
  
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percentage = (x / canvas.width) * 100;
      setPlayerPosition(Math.min(100, Math.max(0, percentage)));
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      handleTouchMove(e);
      fireBullet();
    };
    
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchstart', handleTouchStart);
    
    return () => {
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
    
    const playerX = (playerPosition / 100) * (canvas.width - playerWidth);
    const playerY = canvas.height - playerHeight - 10;
    
    const newBullet: Bullet = {
      x: playerX + playerWidth / 2 - bulletWidth / 2,
      y: playerY,
      width: bulletWidth,
      height: bulletHeight,
      speed: 5,
      active: true
    };
    
    setBullets(prev => [...prev, newBullet]);
  };
  
  const startGame = () => {
    if (isOnCooldown || isPlaying) return;
    
    setIsPlaying(true);
    setGameCompleted(false);
    setScore(0);
    setGameTime(15);
    setViruses([]);
    setBullets([]);
    setPlayerPosition(50);
    
    toast({
      title: "Network Defense",
      description: "Defend your network from viruses!",
    });
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
        <div className="h-[200px] w-full relative">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full rounded-md bg-white"
          />
          
          <div className="sm:hidden flex w-full absolute bottom-0 p-2 justify-between">
            <Button
              variant="outline" 
              size="sm" 
              className="opacity-70"
              onTouchStart={() => setPlayerPosition(prev => Math.max(0, prev - 10))}
            >
              ←
            </Button>
            <Button
              variant="outline" 
              size="sm" 
              className="opacity-70"
              onTouchStart={() => fireBullet()}
            >
              Fire
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="opacity-70"
              onTouchStart={() => setPlayerPosition(prev => Math.min(100, prev + 10))}
            >
              →
            </Button>
          </div>
          
          {gameCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
              <div className="text-center bg-white p-4 rounded-md">
                <div className="text-lg font-bold">Game Over!</div>
                <div className="text-green-600 font-medium">
                  You earned {formatBitcoin(earnedReward)} BTC!
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
              Shoot viruses with bitcoin coins!
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
