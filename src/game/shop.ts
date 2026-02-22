import { ShopItem, ToolId, BagId, ShieldId, WeaponId, PlayerInventory } from './types';

export const SHOP_TOOLS: ShopItem[] = [
  { id: 'glove', name: 'Kesztyű', description: 'Alap szedőeszköz', price: 0, emoji: '🧤', category: 'tool' },
  { id: 'stick', name: 'Szedőbot', description: 'Távolabbról szedhetsz', price: 100, emoji: '🪝', category: 'tool' },
  { id: 'vacuum', name: 'Porszívó', description: 'Még nagyobb hatótáv', price: 500, emoji: '🧹', category: 'tool' },
];

export const SHOP_BAGS: ShopItem[] = [
  { id: 'basic', name: 'Alap zsák', description: '3 szemét fér bele', price: 0, emoji: '👜', category: 'bag' },
  { id: 'medium', name: 'Közepes zsák', description: '10 szemét fér bele', price: 50, emoji: '🎒', category: 'bag' },
  { id: 'large', name: 'Nagy zsák', description: '15 szemét fér bele', price: 200, emoji: '💼', category: 'bag' },
  { id: 'huge', name: 'Óriási zsák', description: '20 szemét fér bele', price: 400, emoji: '🧳', category: 'bag' },
];

export const SHOP_SHIELDS: ShopItem[] = [
  { id: 'lid', name: 'Kukafedő pajzs', description: 'Megvéd a szeméttámadástól (10mp cooldown)', price: 1000, emoji: '🛡️', category: 'shield' as any },
];

export const SHOP_WEAPONS: ShopItem[] = [
  { id: 'taser', name: 'Sokkoló', description: 'Megbénítja a közeli NPC-ket (E gomb, 15mp cooldown)', price: 750, emoji: '⚡', category: 'weapon' },
];

export const WEAPON_RANGE: Record<WeaponId, number> = {
  none: 0,
  taser: 120,
};

export const WEAPON_STUN_DURATION = 300; // 5 seconds at 60fps
export const WEAPON_COOLDOWN = 900; // 15 seconds at 60fps

export const SHIELD_STUN_REDUCTION: Record<ShieldId, number> = {
  none: 0,
  lid: 1,  // blocks stun entirely
};

export const TOOL_RANGES: Record<ToolId, number> = {
  glove: 45,
  stick: 70,
  vacuum: 100,
};

export const BAG_CAPACITY: Record<BagId, number> = {
  basic: 3,
  medium: 10,
  large: 15,
  huge: 20,
};

const INVENTORY_KEY = 'pixelTrashHero_inventory';

export const DEFAULT_INVENTORY: PlayerInventory = {
  coins: 0,
  ownedTools: ['glove'],
  ownedBags: ['basic'],
  ownedShields: ['none'],
  ownedWeapons: ['none'],
  equippedTool: 'glove',
  equippedBag: 'basic',
  equippedShield: 'none',
  equippedWeapon: 'none',
};

export function loadInventory(): PlayerInventory {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...DEFAULT_INVENTORY, ownedTools: ['glove'], ownedBags: ['basic'], ownedShields: ['none'], ownedWeapons: ['none'] };
}

export function saveInventory(inv: PlayerInventory) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
}

export function buyItem(inv: PlayerInventory, item: ShopItem): PlayerInventory | null {
  if (inv.coins < item.price) return null;
  const next = { ...inv, coins: inv.coins - item.price };
  if (item.category === 'tool') {
    if (next.ownedTools.includes(item.id as ToolId)) return null;
    next.ownedTools = [...next.ownedTools, item.id as ToolId];
    next.equippedTool = item.id as ToolId;
  } else if (item.category === 'bag') {
    if (next.ownedBags.includes(item.id as BagId)) return null;
    next.ownedBags = [...next.ownedBags, item.id as BagId];
    next.equippedBag = item.id as BagId;
  } else if (item.category === 'shield') {
    if (next.ownedShields.includes(item.id as ShieldId)) return null;
    next.ownedShields = [...next.ownedShields, item.id as ShieldId];
    next.equippedShield = item.id as ShieldId;
  } else if (item.category === 'weapon') {
    if (next.ownedWeapons.includes(item.id as WeaponId)) return null;
    next.ownedWeapons = [...next.ownedWeapons, item.id as WeaponId];
    next.equippedWeapon = item.id as WeaponId;
  }
  return next;
}
