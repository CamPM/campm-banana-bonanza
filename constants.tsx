
import { TierInfo, SkinDefinition, CosmeticItem, Category } from './types';

// Distinct tier colors for visual clarity
export const TIERS: TierInfo[] = [
  { tier: 0, radius: 15, color: '#FF4D4D', name: 'T1', score: 2 },
  { tier: 1, radius: 22, color: '#FFA500', name: 'T2', score: 4 },
  { tier: 2, radius: 32, color: '#FFFF00', name: 'T3', score: 8 },
  { tier: 3, radius: 42, color: '#32CD32', name: 'T4', score: 16 },
  { tier: 4, radius: 55, color: '#00FA9A', name: 'T5', score: 32 },
  { tier: 5, radius: 70, color: '#1E90FF', name: 'T6', score: 64 },
  { tier: 6, radius: 85, color: '#4169E1', name: 'T7', score: 128 },
  { tier: 7, radius: 105, color: '#9370DB', name: 'T8', score: 256 },
  { tier: 8, radius: 125, color: '#BA55D3', name: 'T9', score: 512 },
  { tier: 9, radius: 150, color: '#FF69B4', name: 'T10', score: 1024 },
  { tier: 10, radius: 180, color: '#FF1493', name: 'T11', score: 2048 },
  { tier: 11, radius: 210, color: '#FFD700', name: 'T12', score: 4096 },
];

export const SKINS: SkinDefinition[] = [
  {
    id: 'sk_space',
    name: 'Space Pack',
    physics: { restitution: 0.2, friction: 0.1 },
    phrases: ['ASTEROID HIT!', 'SUPERNOVA!', 'ORBIT STABLE!', 'VOID MERGE!', 'STARDUST!'],
    emojis: ['🚀', '🪐', '🛰️', '☄️', '🔭', '👨‍🚀', '🛸', '🌌', '☀️', '🌕', '👽', '🌠']
  },
  {
    id: 'sk_weather',
    name: 'Weather Pack',
    physics: { restitution: 0.3, friction: 0.08 },
    phrases: ['STORM BREWING!', 'LIGHTNING!', 'SUNNY DAYS!', 'THUNDER CLAP!', 'RAINBOW!'],
    emojis: ['☁️', '🌦️', '⛈️', '🌩️', '🌪️', '🌬️', '❄️', '☔', '☀️', '🌈', '🌊', '⚡']
  },
  {
    id: 'sk_ocean',
    name: 'Ocean Pack',
    physics: { restitution: 0.4, friction: 0.06 },
    phrases: ['TIDAL WAVE!', 'DEEP DIVE!', 'SPLASH!', 'CORAL REEF!', 'OCEAN BREEZE!'],
    emojis: ['🐚', '🦀', '🐟', '🐡', '🐙', '🐢', '🐬', '🦈', '🐳', '🐋', '⚓', '🏝️']
  },
  {
    id: 'sk_nature',
    name: 'Nature Pack',
    physics: { restitution: 0.5, friction: 0.05 },
    phrases: ['LEAF FALL!', 'BLOOM!', 'FOREST GROW!', 'ROOTED!', 'NATURE CALM!'],
    emojis: ['🌿', '🍄', '🌲', '🪵', '🍁', '🌻', '🌵', '🌴', '🎋', '🌾', '🌹', '🌋']
  },
  {
    id: 'sk_music',
    name: 'Music Pack',
    physics: { restitution: 0.6, friction: 0.04 },
    phrases: ['BASS DROP!', 'HARMONY!', 'RHYTHM!', 'MELODY!', 'FORTE!'],
    emojis: ['🎵', '🎶', '🎸', '🎹', '🥁', '🎷', '🎻', '🎤', '🎧', '📻', '🎼', '🕺']
  },
  {
    id: 'sk_animals',
    name: 'Animal Pack',
    physics: { restitution: 0.7, friction: 0.03 },
    phrases: ['WILD ROAR!', 'PAW POWER!', 'PACK LEADER!', 'SAVAGE!', 'FEATHERY!'],
    emojis: ['🐭', '🐰', '🦊', '🐻', '🐼', '🦁', '🐯', '🐘', '🦒', '🐒', '🦍', '🐉']
  },
  {
    id: 'sk_fruit',
    name: 'Fruit Pack',
    physics: { restitution: 0.75, friction: 0.02 },
    phrases: ['FRUIT PUNCH!', 'JUICY!', 'ZESTY!', 'SWEET MERGE!', 'PEEL IT!'],
    emojis: ['🍒', '🍓', '🍇', '🍊', '🍅', '🍎', '🍐', '🍑', '🍍', '🍈', '🍉', '🍌']
  },
  {
    id: 'sk_dessert',
    name: 'Dessert Pack',
    physics: { restitution: 0.8, friction: 0.01 },
    phrases: ['SUGAR RUSH!', 'CREAMY!', 'SWEET SPOT!', 'GLAZED!', 'CHOCO BLAST!'],
    emojis: ['🍪', '🧁', '🍩', '🍦', '🍧', '🍰', '🥧', '🍮', '🍯', '🍬', '🍭', '🎂']
  },
];

export const INITIAL_COSMETICS: CosmeticItem[] = [
  // Skins (8)
  ...SKINS.map(s => ({ id: s.id, name: s.name, category: Category.SKINS, price: s.id === 'sk_fruit' ? 0 : 1200, unlocked: s.id === 'sk_fruit', value: s })),
  
  // Hitboxes (4)
  { id: 'hb_tiered', name: 'Tiered Glow', category: Category.OUTLINES_HITBOXES, subCategory: 'Hitbox', price: 0, unlocked: true, value: 'tiered' },
  { id: 'hb_transparent', name: 'Clear Glass', category: Category.OUTLINES_HITBOXES, subCategory: 'Hitbox', price: 400, unlocked: false, value: 'transparent' },
  { id: 'hb_white', name: 'Frosted', category: Category.OUTLINES_HITBOXES, subCategory: 'Hitbox', price: 400, unlocked: false, value: 'white' },
  { id: 'hb_rainbow', name: 'Holographic', category: Category.OUTLINES_HITBOXES, subCategory: 'Hitbox', price: 2500, unlocked: false, value: 'rainbow' },

  // Outlines (4)
  { id: 'ot_default', name: 'Standard', category: Category.OUTLINES_HITBOXES, subCategory: 'Outline', price: 0, unlocked: true, value: 'default' },
  { id: 'ot_black', name: 'Inky Bold', category: Category.OUTLINES_HITBOXES, subCategory: 'Outline', price: 500, unlocked: false, value: 'black' },
  { id: 'ot_rainbow', name: 'RGB Wave', category: Category.OUTLINES_HITBOXES, subCategory: 'Outline', price: 1500, unlocked: false, value: 'rainbow' },
  { id: 'ot_gold', name: 'Golden Aura', category: Category.OUTLINES_HITBOXES, subCategory: 'Outline', price: 3000, unlocked: false, value: 'gold' },

  // Themes (16) - Split: 8 Dark, 8 Pastel
  // Dark Themes
  { id: 'th_obsidian', name: 'Deep Obsidian', category: Category.THEMES, price: 0, unlocked: true, value: '#09090b' },
  { id: 'th_midnight', name: 'Midnight Blue', category: Category.THEMES, price: 300, unlocked: false, value: '#020617' },
  { id: 'th_void', name: 'Infinite Void', category: Category.THEMES, price: 600, unlocked: false, value: '#000000' },
  { id: 'th_charcoal', name: 'Matte Charcoal', category: Category.THEMES, price: 900, unlocked: false, value: '#171717' },
  { id: 'th_forest', name: 'Dark Forest', category: Category.THEMES, price: 1200, unlocked: false, value: '#064e3b' },
  { id: 'th_crimson', name: 'Vampire Red', category: Category.THEMES, price: 1500, unlocked: false, value: '#450a0a' },
  { id: 'th_cyber', name: 'Cyber Matrix', category: Category.THEMES, price: 3000, unlocked: false, value: '#001a00' }, // Fun one
  { id: 'th_nebula', name: 'Stellar Nebula', category: Category.THEMES, price: 5000, unlocked: false, value: '#1a1033' }, // Fun one

  // Pastel Themes
  { id: 'th_vanilla', name: 'Vanilla Cream', category: Category.THEMES, price: 500, unlocked: false, value: '#fff7ed' },
  { id: 'th_lavender', name: 'Lavender Mist', category: Category.THEMES, price: 800, unlocked: false, value: '#f5f3ff' },
  { id: 'th_mint', name: 'Mint Sorbet', category: Category.THEMES, price: 1100, unlocked: false, value: '#ecfdf5' },
  { id: 'th_blue', name: 'Baby Blue', category: Category.THEMES, price: 1400, unlocked: false, value: '#eff6ff' },
  { id: 'th_rose', name: 'Petal Pink', category: Category.THEMES, price: 1700, unlocked: false, value: '#fff1f2' },
  { id: 'th_lemon', name: 'Lemonade', category: Category.THEMES, price: 2000, unlocked: false, value: '#fefce8' },
  { id: 'th_peach', name: 'Peach Fizz', category: Category.THEMES, price: 4000, unlocked: false, value: '#fff5f1' }, // Fun one
  { id: 'th_cotton', name: 'Cotton Candy', category: Category.THEMES, price: 8000, unlocked: false, value: '#ffffff' }, // Fun one

  // Borders (16) - Split: 8 Dark, 8 Pastel
  // Dark Borders
  { id: 'bd_zinc', name: 'Industrial Zinc', category: Category.BORDERS, price: 0, unlocked: true, value: '#3f3f46' },
  { id: 'bd_graphite', name: 'Sleek Graphite', category: Category.BORDERS, price: 400, unlocked: false, value: '#18181b' },
  { id: 'bd_metal', name: 'Gunmetal', category: Category.BORDERS, price: 800, unlocked: false, value: '#27272a' },
  { id: 'bd_carbon', name: 'Carbon Fiber', category: Category.BORDERS, price: 1200, unlocked: false, value: '#09090b' },
  { id: 'bd_neon', name: 'Electric Cyan', category: Category.BORDERS, price: 2000, unlocked: false, value: '#22d3ee' }, // Fun one
  { id: 'bd_gold', name: 'Luxe Gold', category: Category.BORDERS, price: 3500, unlocked: false, value: '#fbbf24' }, // Fun one
  { id: 'bd_obsidian', name: 'Volcanic Glass', category: Category.BORDERS, price: 6000, unlocked: false, value: '#0a0a0a' }, // Fun one
  { id: 'bd_shadow', name: 'Shadow Realm', category: Category.BORDERS, price: 10000, unlocked: false, value: '#000000' }, // Fun one

  // Pastel Borders
  { id: 'bd_pearl', name: 'Polished Pearl', category: Category.BORDERS, price: 600, unlocked: false, value: '#f4f4f5' },
  { id: 'bd_silver', name: 'Soft Silver', category: Category.BORDERS, price: 1000, unlocked: false, value: '#e4e4e7' },
  { id: 'bd_candy', name: 'Pink Frost', category: Category.BORDERS, price: 1400, unlocked: false, value: '#fdf2f8' },
  { id: 'bd_lilac', name: 'Lilac Bloom', category: Category.BORDERS, price: 1800, unlocked: false, value: '#f5f3ff' },
  { id: 'bd_sky', name: 'Sky Glow', category: Category.BORDERS, price: 2500, unlocked: false, value: '#f0f9ff' }, // Fun one
  { id: 'bd_sakura', name: 'Sakura Petal', category: Category.BORDERS, price: 4000, unlocked: false, value: '#fef2f2' }, // Fun one
  { id: 'bd_rainbow', name: 'Chroma Dream', category: Category.BORDERS, price: 7500, unlocked: false, value: 'rainbow' }, // Fun one
  { id: 'bd_cloud', name: 'Fluffy Cloud', category: Category.BORDERS, price: 15000, unlocked: false, value: '#fafaf9' }, // Fun one
];
