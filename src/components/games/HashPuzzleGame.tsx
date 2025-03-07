
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
  
  // Improved maze generation algorithm
  const generateMaze = () => {
    // Create an empty maze filled with walls
    const newMaze: MazeGrid = Array(MAZE_SIZE).fill(0).map(() => 
      Array(MAZE_SIZE).fill(1)
    );
    
    // Use a modified depth-first search algorithm to create paths
    const stack: Position[] = [];
    const visited: boolean[][] = Array(MAZE_SIZE).fill(0).map(() => 
      Array(MAZE_SIZE).fill(false)
    );
    
    // Start at a random position (can be customized)
    const startX = 0;
    const startY = 0;
    newMaze[startY][startX] = 0;
    visited[startY][startX] = true;
    stack.push({ x: startX, y: startY });
    
    // Define directions: right, down, left, up
    const directions = [
      [1, 0], [0, 1], [-1, 0], [0, -1]
    ];
    
    // Carve paths using DFS
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      
      // Shuffle directions for randomness
      const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
      
      let foundNext = false;
      
      for (const [dx, dy] of shuffledDirs) {
        const nx = current.x + dx * 2;
        const ny = current.y + dy * 2;
        
        if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && !visited[ny][nx]) {
          // Carve path to the next cell
          newMaze[current.y + dy][current.x + dx] = 0;
          newMaze[ny][nx] = 0;
          visited[ny][nx] = true;
          stack.push({ x: nx, y: ny });
          foundNext = true;
          break;
        }
      }
      
      // If no unvisited neighbors, backtrack
      if (!foundNext) {
        stack.pop();
      }
    }
    
    // Ensure start and exit are paths
    newMaze[PLAYER_START.y][PLAYER_START.x] = 0;
    newMaze[EXIT_POSITION.y][EXIT_POSITION.x] = 0;
    
    // Ensure there's always a valid path from start to exit
    ensureValidPath(newMaze);
    
    return newMaze;
  };
  
  // Function to ensure there's always a valid path from start to exit
  const ensureValidPath = (maze: MazeGrid) => {
    // Create a simple path along edges if needed
    const needsPathFix = !isPathExist(maze, PLAYER_START, EXIT_POSITION);
    
    if (needsPathFix) {
      // Create a path along the top and right edges
      for (let x = 0; x < MAZE_SIZE; x++) {
        maze[0][x] = 0; // Top row
      }
      
      for (let y = 0; y < MAZE_SIZE; y++) {
        maze[y][MAZE_SIZE - 1] = 0; // Right column
      }
    }
  };
  
  // Check if a path exists using breadth-first search
  const isPathExist = (maze: MazeGrid, start: Position, end: Position): boolean => {
    const queue: Position[] = [start];
    const visited: boolean[][] = Array(MAZE_SIZE).fill(0).map(() => 
      Array(MAZE_SIZE).fill(false)
    );
    visited[start.y][start.x] = true;
    
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.x === end.x && current.y === end.y) {
        return true;
      }
      
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        
        if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && 
            maze[ny][nx] === 0 && !visited[ny][nx]) {
          visited[ny][nx] = true;
          queue.push({ x: nx, y: ny });
        }
      }
    }
    
    return false;
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
    // Increased rewards for faster progression
    const baseBTC = 0.0002; // Doubled from 0.0001
    const randomBonus = Math.random() * 0.001; // Doubled from 0.0005
    const levelMultiplier = 1 + (game.id * 0.3); // Increased from 0.2
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
    
    // Generate a new maze each time
    const newMaze = generateMaze();
    setMaze(newMaze);
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
            const isStart = PLAYER_START.x === x && PLAYER_START.y === y && !isPlayer;
            
            return (
              <div 
                key={`${x}-${y}`} 
                className={cn(
                  "w-9 h-9 flex items-center justify-center",
                  cell === 1 ? "bg-gray-800" : "bg-white border border-gray-200",
                  isPlayer && "bg-bitcoin animate-pulse",
                  isExit && !isPlayer && "bg-green-100",
                  isStart && "bg-blue-100"
                )}
              >
                {isPlayer && <Navigation className="w-5 h-5 text-white" />}
                {isExit && !isPlayer && <Flag className="w-5 h-5 text-green-600" />}
                {isStart && !isPlayer && <MapPin className="w-5 h-5 text-blue-600" />}
                {!isPlayer && !isExit && !isStart && cell === 0 && (x + y) % 4 === 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
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
            <div className="text-center py-2 animate-fade-in">
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
