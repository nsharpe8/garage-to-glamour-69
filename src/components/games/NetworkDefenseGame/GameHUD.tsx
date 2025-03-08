import React from 'react';
import { GameHUDProps } from './types';

export const GameHUD: React.FC<GameHUDProps> = ({ score, gameTime, totalGameTime }) => {
  // This component could be used if we want to move the HUD rendering from canvas to DOM
  // For now, we're keeping the HUD rendering in the canvas for simplicity
  return null;
};
