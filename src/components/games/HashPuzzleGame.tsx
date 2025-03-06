
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Clock, MapPin, Navigation, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "@/components/ui/use-toast";
import { MiniGame as MiniGameType } from '@/types/gameTypes';

interface HashPuzzleGameProps {
  game: MiniGameType;
}

const MAZE_SIZE = 7;
const PLAYER_START = { x: 0, y: 0 };
const EXIT_POSITION = { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 };

// Cell types: 0 = path, 1 = wall
type MazeGrid = number[][];
type Position = { x: number; y: number };

const HashPuzzleGame: React.FC<HashPuzzleGameProps> = ({ game }) => {
  const { playMiniGame, formatBitcoin } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [maze, setMaze] = useState<MazeGrid>([]);
  const [playerPosition, setPlayerPosition] = useState<Position>(PLAYER_START);
  const [earnedReward, setEarnedReward] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const now = Date.now();
  const cooldownEnds = game.lastPlayed + (game.cooldown * 1000);
  const isOnCooldown = now < cooldownEnds;
  const remainingCooldown = Math.ceil((cooldownEnds - now) / 1000);
  
  // Generate a random maze
  const generateMaze = () => {
    // Create an empty maze filled with walls
    const newMaze: MazeGrid = Array(MAZE_SIZE).fill(0).map(() => 
      Array(MAZE_SIZE).fill(1)
    );
    
    // Simple random maze generation algorithm
    const carvePassage = (x: number, y: number) => {
      newMaze[y][x] = 0; // Mark as path
      
      // Define directions: right, down, left, up
      const directions = [
        [1, 0], [0, 1], [-1, 0], [0, -1]
      ];
      
      // Shuffle directions
      for (let i = directions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
      }
      
      // Try each direction
      for (const [dx, dy] of directions) {
        const nx = x + dx * 2;
        const ny = y + dy * 2;
        
        if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && newMaze[ny][nx] === 1) {
          // Carve passage between current cell and the next cell
          newMaze[y + dy][x + dx] = 0;
          carvePassage(nx, ny);
        }
      }
    };
    
    // Start carving from top-left
    carvePassage(0, 0);
    
    // Ensure start and exit are paths
    newMaze[PLAYER_START.y][PLAYER_START.x] = 0;
    newMaze[EXIT_POSITION.y][EXIT_POSITION.x] = 0;
    
    // Ensure there's a path to the exit (simple approach: make some random paths)
    for (let i = 0; i < MAZE_SIZE; i++) {
      newMaze[Math.floor(Math.random() * MAZE_SIZE)][i] = 0;
      newMaze[i][Math.floor(Math.random() * MAZE_SIZE)] = 0;
    }
    
    return newMaze;
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isPlaying || gameCompleted) return;
    
    let newX = playerPosition.x;
    let newY = playerPosition.y;
    
    switch (e.key) {
      case 'ArrowUp':
        newY = Math.max(0, playerPosition.y - 1);
        break;
      case 'ArrowDown':
        newY = Math.min(MAZE_SIZE - 1, playerPosition.y + 1);
        break;
      case 'ArrowLeft':
        newX = Math.max(0, playerPosition.x - 1);
        break;
      case 'ArrowRight':
        newX = Math.min(MAZE_SIZE - 1, playerPosition.x + 1);
        break;
      default:
        return;
    }
    
    // Check if the new position is a valid path
    if (maze[newY] && maze[newY][newX] === 0) {
      setPlayerPosition({ x: newX, y: newY });
      
      // Check if player reached the exit
      if (newX === EXIT_POSITION.x && newY === EXIT_POSITION.y) {
        handleWin();
      }
    }
  };
  
  const handleWin = () => {
    // Calculate reward based on level and some randomness
    const baseBTC = 0.0001;
    const randomBonus = Math.random() * 0.0005;
    const levelMultiplier = 1 + (game.id * 0.2); // Higher multiplier for maze game
    const reward = (baseBTC + randomBonus) * levelMultiplier;
    
    setEarnedReward(reward);
    setGameCompleted(true);
    
    // Call the context to update the game state
    playMiniGame(game.id, reward);
    
    // End the game after a delay
    setTimeout(() => {
      setIsPlaying(false);
      setGameCompleted(false);
    }, 3000);
  };
  
  const startGame = () => {
    if (isOnCooldown || isPlaying) return;
    
    setMaze(generateMaze());
    setPlayerPosition(PLAYER_START);
    setGameCompleted(false);
    setIsPlaying(true);
    
    // Display instructions
    toast({
      title: "Hash Puzzle Started",
      description: "Use arrow keys to navigate the maze and collect the Bitcoin!",
    });
  };
  
  // Add event listeners for keyboard controls
  useEffect(() => {
    if (isPlaying) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, playerPosition, maze]);
  
  // Render the maze grid
  const renderMaze = () => {
    return (
      <div className="grid grid-cols-7 gap-0.5 mx-auto max-w-[280px] my-2">
        {maze.map((row, y) => 
          row.map((cell, x) => {
            const isPlayer = playerPosition.x === x && playerPosition.y === y;
            const isExit = EXIT_POSITION.x === x && EXIT_POSITION.y === y;
            
            return (
              <div 
                key={`${x}-${y}`} 
                className={cn(
                  "w-9 h-9 flex items-center justify-center",
                  cell === 1 ? "bg-gray-800" : "bg-white border border-gray-200",
                  isPlayer && "bg-bitcoin",
                  isExit && !isPlayer && "bg-green-100"
                )}
              >
                {isPlayer && <Navigation className="w-5 h-5 text-white" />}
                {isExit && !isPlayer && <Flag className="w-5 h-5 text-green-600" />}
                {!isPlayer && !isExit && cell === 0 && (x + y) % 3 === 0 && (
                  <MapPin className="w-3 h-3 text-gray-300" />
                )}
              </div>
            );
          })
        )}
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
        <div className="mb-2">
          {gameCompleted ? (
            <div className="text-center py-2">
              <div className="text-green-600 font-medium mb-2">
                You earned {formatBitcoin(earnedReward)} BTC!
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 text-xs text-center text-gray-500">
                Use arrow keys to move. Get to the <Flag className="inline w-3 h-3 text-green-600" /> flag!
              </div>
              {renderMaze()}
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

export default HashPuzzleGame;
