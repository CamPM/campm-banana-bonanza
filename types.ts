
export enum Category {
  SKINS = 'Skins',
  OUTLINES_HITBOXES = 'Outlines & Hitboxes',
  THEMES = 'Themes',
  BORDERS = 'Borders'
}

export type HitboxStyle = 'tiered' | 'transparent' | 'white' | 'rainbow';
export type OutlineStyle = 'default' | 'black' | 'rainbow' | 'gold';

export interface CosmeticItem {
  id: string;
  name: string;
  category: Category;
  subCategory?: 'Outline' | 'Hitbox';
  price: number;
  unlocked: boolean;
  value: any; 
}

export interface TierInfo {
  tier: number;
  radius: number;
  color: string;
  name: string;
  score: number;
}

export interface PhysicsConfig {
  restitution: number;
  friction: number;
}

export interface SkinDefinition {
  id: string;
  name: string;
  physics: PhysicsConfig;
  phrases: string[];
  emojis: string[]; // Added: 12 emojis for each skin pack
}

export interface GameState {
  score: number;
  highScore: number;
  coins: number;
  highestTier: number;
  activeSkin: string;
  activeTheme: string;
  activeBorder: string;
  activeHitbox: string;
  activeOutline: string;
}
