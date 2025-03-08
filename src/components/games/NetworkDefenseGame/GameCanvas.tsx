
import React, { useEffect, useRef, useState } from 'react';
import { GameCanvasProps, Virus, Bullet } from './types';
import { GameHUD } from './GameHUD';

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerPosition,
  setPlayerPosition,
  viruses,
  setViruses,
  bullets,
  setBullets,
  gameTime,
  setGameTime,
  score,
  updateScore,
  endGame
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Image references
  const bitcoinImgRef = useRef<HTMLImageElement | null>(null);
  const virusImgRef = useRef<HTMLImageElement | null>(null);
  const bulletImgRef = useRef<HTMLImageElement | null>(null);
  
  const TOTAL_GAME_TIME = 15; // 15 seconds game
  
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
  
  // Main game loop
  useEffect(() => {
    if (!canvasRef.current) return;
    
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
      const remainingTime = Math.max(0, TOTAL_GAME_TIME - elapsedSeconds);
      setGameTime(remainingTime);
      
      if (remainingTime <= 0) {
        endGame();
        return;
      }
      
      // Draw game background with gradient
      drawBackground(ctx, canvas);
      
      // Calculate the player's actual pixel position based on percentage
      const playerX = (playerPosition.x / 100) * (canvas.width - playerWidth);
      const playerY = canvas.height - playerHeight - 10;
      
      // Draw player (Bitcoin)
      drawPlayer(ctx, playerX, playerY, playerWidth, playerHeight);
      
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
      
      setViruses(prev => prev
        .map(virus => {
          if (!virus.active) return virus;
          
          const newY = virus.y + virus.speed;
          
          if (newY > canvas.height) {
            return {...virus, active: false};
          }
          
          return {...virus, y: newY};
        })
        .filter(virus => virus.active)
      );
      
      // Draw viruses with glow effect
      viruses.forEach(virus => {
        drawVirus(ctx, virus);
      });
      
      setBullets(prev => prev
        .map(bullet => {
          if (!bullet.active) return bullet;
          
          const newY = bullet.y - bullet.speed;
          
          if (newY < -bulletHeight) {
            return {...bullet, active: false};
          }
          
          return {...bullet, y: newY};
        })
        .filter(bullet => bullet.active)
      );
      
      // Draw bullets with trail effect
      bullets.forEach(bullet => {
        drawBullet(ctx, bullet);
      });
      
      // Check for collisions
      checkCollisions(ctx);
      
      // Draw HUD
      renderGameHUD(ctx, canvas, score, remainingTime, TOTAL_GAME_TIME);
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
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
    };
    
    const drawPlayer = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      width: number, 
      height: number
    ) => {
      if (bitcoinImgRef.current && imagesLoaded) {
        try {
          ctx.drawImage(bitcoinImgRef.current, x, y, width, height);
          // Add glow effect around player
          ctx.shadowColor = '#FFA500';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(x + width / 2, y + height / 2, width / 2 - 5, 0, Math.PI * 2);
          ctx.closePath();
          ctx.shadowBlur = 0;
        } catch (error) {
          // Fallback rendering
          ctx.fillStyle = '#F7931A';
          ctx.beginPath();
          ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Fallback rendering
        ctx.fillStyle = '#F7931A';
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    const drawVirus = (ctx: CanvasRenderingContext2D, virus: Virus) => {
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
    };
    
    const drawBullet = (ctx: CanvasRenderingContext2D, bullet: Bullet) => {
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
    };
    
    const checkCollisions = (ctx: CanvasRenderingContext2D) => {
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
              updateScore(10);
              
              // Visual feedback for hit - add explosion effect
              const explosionX = virus.x + virus.width / 2;
              const explosionY = virus.y + virus.height / 2;
              
              ctx.fillStyle = 'rgba(255, 170, 0, 0.7)';
              ctx.beginPath();
              ctx.arc(explosionX, explosionY, 20, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      });
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [
    playerPosition, 
    viruses, 
    bullets, 
    score, 
    gameTime, 
    imagesLoaded, 
    endGame, 
    setGameTime, 
    setViruses, 
    setBullets,
    updateScore
  ]);
  
  // Mouse tracking for player movement
  useEffect(() => {
    if (!canvasRef.current) return;
    
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
  }, [setPlayerPosition]);
  
  const fireBullet = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const playerWidth = 50;
    const playerHeight = 50;
    const bulletWidth = 15;
    const bulletHeight = 15;
    
    // Get the current player position
    const playerX = (playerPosition.x / 100) * (canvas.width - playerWidth);
    const playerY = canvas.height - playerHeight - 10;
    
    // Calculate the center of the bitcoin
    const bitcoinCenterX = playerX + (playerWidth / 2);
    
    // Create a new bullet exactly at the center of the bitcoin
    const newBullet: Bullet = {
      x: bitcoinCenterX - (bulletWidth / 2), // This ensures bullet is centered with the player
      y: playerY, // Start at top of player
      width: bulletWidth,
      height: bulletHeight,
      speed: 6,
      active: true
    };
    
    setBullets(prev => [...prev, newBullet]);
  };
  
  // Separate function to render the HUD for better code organization
  const renderGameHUD = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    score: number, 
    remainingTime: number,
    totalGameTime: number
  ) => {
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
    const timerFillWidth = (remainingTime / totalGameTime) * timerWidth;
    let timerColor = '#4CAF50'; // Green
    if (remainingTime < 5) timerColor = '#F44336'; // Red when time running out
    else if (remainingTime < 10) timerColor = '#FFC107'; // Yellow when time getting low
    
    ctx.fillStyle = timerColor;
    ctx.fillRect(timerX, timerY, timerFillWidth, timerHeight);
    
    // Timer text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Arial';
    ctx.fillText(`${remainingTime}s`, timerX + timerWidth + 5, timerY + 9);
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full bg-gradient-to-b from-blue-900 to-black"
    />
  );
};
