import { CityConfig, CityId, SaveData, TrashType } from './types';

export const GAME_DURATION = 600; // 10 minutes in seconds
export const TILE_SIZE = 32;
export const PLAYER_SPEED = 3;
export const PLAYER_SIZE = 28;
export const TRASH_SIZE = 20;
export const BIN_WIDTH = 40;
export const BIN_HEIGHT = 48;
export const PICKUP_RANGE = 45;
export const DROP_RANGE = 55;
export const STUN_DURATION = 60; // frames (~1 second)
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PHASE_THRESHOLDS = {
  calm: 0,
  'light-wind': 120,    // 2 min
  'strong-wind': 240,   // 4 min
  attack: 300,           // 5 min
  chaos: 480,            // 8 min
};

export const WIND_SPEEDS: Record<string, number> = {
  calm: 0,
  'light-wind': 0.3,
  'strong-wind': 0.8,
  attack: 0.6,
  chaos: 1.2,
};

export const TRASH_COLORS: Record<TrashType, string> = {
  paper: '#4A90D9',
  plastic: '#F5A623',
  glass: '#7ED321',
  organic: '#8B572A',
  mixed: '#9B9B9B',
  bonus: '#F8E71C',
};

export const BIN_COLORS: Record<string, string> = {
  paper: '#2E6AB0',
  plastic: '#D4890A',
  glass: '#5CA31B',
  organic: '#6B3F1A',
  mixed: '#6B6B6B',
};

export const TRASH_LABELS: Record<TrashType, string> = {
  paper: '📰',
  plastic: '🧴',
  glass: '🍾',
  organic: '🍎',
  mixed: '🚬',
  bonus: '⭐',
};

export const BIN_LABELS: Record<string, string> = {
  paper: '📘',
  plastic: '📒',
  glass: '📗',
  organic: '📕',
  mixed: '📓',
};

export const CITIES: CityConfig[] = [
  {
    id: 'budapest',
    name: 'Budapest',
    nameHu: 'Budapest',
    trashCount: 40,
    windMultiplier: 1,
    attackMultiplier: 1,
    bgColor: '#3D5A80',
    accentColor: '#EE6C4D',
    landmarks: ['Lánchíd', 'Villamos', 'Duna'],
  },
  {
    id: 'paris',
    name: 'Paris',
    nameHu: 'Párizs',
    trashCount: 50,
    windMultiplier: 1.1,
    attackMultiplier: 1.1,
    bgColor: '#E8D5B7',
    accentColor: '#C1666B',
    landmarks: ['Eiffel-torony', 'Kávézó', 'Macaron'],
  },
  {
    id: 'newyork',
    name: 'New York',
    nameHu: 'New York',
    trashCount: 60,
    windMultiplier: 1.2,
    attackMultiplier: 1.2,
    bgColor: '#4A4E69',
    accentColor: '#F2CC8F',
    landmarks: ['Taxi', 'Central Park', 'Felhőkarcoló'],
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    nameHu: 'Tokió',
    trashCount: 70,
    windMultiplier: 1.3,
    attackMultiplier: 1.3,
    bgColor: '#1A1A2E',
    accentColor: '#E94560',
    landmarks: ['Neon', 'Torii', 'Sakura'],
  },
  {
    id: 'london',
    name: 'London',
    nameHu: 'London',
    trashCount: 80,
    windMultiplier: 1.5,
    attackMultiplier: 1.5,
    bgColor: '#2D3436',
    accentColor: '#D63031',
    landmarks: ['Big Ben', 'Telefonfülke', 'Esernyő'],
  },
];

export const DEFAULT_SAVE: SaveData = {
  budapest: { unlocked: true, bestScore: 0, stars: 0 },
  paris: { unlocked: false, bestScore: 0, stars: 0 },
  newyork: { unlocked: false, bestScore: 0, stars: 0 },
  tokyo: { unlocked: false, bestScore: 0, stars: 0 },
  london: { unlocked: false, bestScore: 0, stars: 0 },
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem('pixelTrashHero_save');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...DEFAULT_SAVE };
}

export function saveSave(data: SaveData) {
  localStorage.setItem('pixelTrashHero_save', JSON.stringify(data));
}

export const CITY_ORDER: CityId[] = ['budapest', 'paris', 'newyork', 'tokyo', 'london'];

export const SCORE_CORRECT = 3;
export const SCORE_WRONG = -2;
export const SCORE_BONUS = 8;

// NPC litterer settings
export const NPC_COUNT = 3;
export const NPC_SPEED = 1.2;
export const NPC_DROP_INTERVAL = 600; // frames (~10 seconds)
