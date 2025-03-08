
export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}

export interface Virus extends Entity {}
export interface Bullet extends Entity {}

export interface GameCanvasProps {
  playerPosition: { x: number, y: number };
  setPlayerPosition: React.Dispatch<React.SetStateAction<{ x: number, y: number }>>;
  viruses: Virus[];
  setViruses: React.Dispatch<React.SetStateAction<Virus[]>>;
  bullets: Bullet[];
  setBullets: React.Dispatch<React.SetStateAction<Bullet[]>>;
  gameTime: number;
  setGameTime: React.Dispatch<React.SetStateAction<number>>;
  score: number;
  updateScore: (points: number) => void;
  endGame: () => void;
}

export interface GameHUDProps {
  score: number;
  gameTime: number;
  totalGameTime: number;
}

export interface GameOverScreenProps {
  score: number;
  earnedReward: number;
  formatBitcoin: (value: number) => string;
}
