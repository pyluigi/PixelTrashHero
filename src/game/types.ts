export type TrashType = 'paper' | 'plastic' | 'glass' | 'organic' | 'mixed' | 'bonus';

export type BinType = 'paper' | 'plastic' | 'glass' | 'organic' | 'mixed';

export type GamePhase = 'calm' | 'light-wind' | 'strong-wind' | 'attack' | 'chaos';

export type CityId = 'budapest' | 'paris' | 'newyork' | 'tokyo' | 'london';

export type ToolId = 'glove' | 'stick' | 'vacuum';
export type BagId = 'basic' | 'medium' | 'large' | 'huge';
export type ShieldId = 'none' | 'lid';
export type WeaponId = 'none' | 'taser';

export interface ShopItem {
  id: ToolId | BagId | ShieldId | WeaponId;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: 'tool' | 'bag' | 'shield' | 'weapon';
}

export interface Position {
  x: number;
  y: number;
}

export interface TrashItem {
  id: string;
  type: TrashType;
  pos: Position;
  velocity: Position;
  alive: boolean;
  fleeing: boolean;
}

export interface NPC {
  id: string;
  pos: Position;
  targetPos: Position;
  dropTimer: number;
  emoji: string;
  stunTimer: number;
}

export interface Bin {
  type: BinType;
  pos: Position;
  width: number;
  height: number;
}

export interface Player {
  pos: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  carrying: TrashType[];
  maxCarry: number;
  stunTimer: number;
  animFrame: number;
  pickupRange: number;
  shieldCooldown: number;
  weaponCooldown: number;
}

export interface CityConfig {
  id: CityId;
  name: string;
  nameHu: string;
  trashCount: number;
  windMultiplier: number;
  attackMultiplier: number;
  bgColor: string;
  accentColor: string;
  landmarks: string[];
}

export type ObstacleType = 'bush' | 'tree';

export interface Obstacle {
  pos: Position;
  width: number;
  height: number;
  type: ObstacleType;
}

export interface GameState {
  player: Player;
  trashItems: TrashItem[];
  npcs: NPC[];
  bins: Bin[];
  obstacles: Obstacle[];
  score: number;
  correctDrops: number;
  wrongDrops: number;
  timeLeft: number;
  phase: GamePhase;
  city: CityConfig;
  paused: boolean;
  gameOver: boolean;
  phaseMessage: string | null;
  phaseMessageTimer: number;
}

export interface CityProgress {
  unlocked: boolean;
  bestScore: number;
  stars: number;
}

export interface PlayerInventory {
  coins: number;
  ownedTools: ToolId[];
  ownedBags: BagId[];
  ownedShields: ShieldId[];
  ownedWeapons: WeaponId[];
  equippedTool: ToolId;
  equippedBag: BagId;
  equippedShield: ShieldId;
  equippedWeapon: WeaponId;
}

export type SaveData = Record<CityId, CityProgress>;
