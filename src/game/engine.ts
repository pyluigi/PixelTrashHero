import {
  GameState, TrashItem, Player, GamePhase, CityConfig, TrashType, Bin, NPC, Obstacle
} from './types';
import {
  GAME_DURATION, PLAYER_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT,
  PICKUP_RANGE, DROP_RANGE, STUN_DURATION, BIN_WIDTH, BIN_HEIGHT,
  TRASH_SIZE, PLAYER_SIZE, PHASE_THRESHOLDS, WIND_SPEEDS,
  SCORE_CORRECT, SCORE_WRONG, SCORE_BONUS, NPC_COUNT, NPC_SPEED, NPC_DROP_INTERVAL
} from './constants';
import { loadInventory, TOOL_RANGES, BAG_CAPACITY, SHIELD_STUN_REDUCTION, WEAPON_RANGE, WEAPON_STUN_DURATION, WEAPON_COOLDOWN } from './shop';

const SHIELD_COOLDOWN_FRAMES = 600; // ~10 seconds at 60fps

const TRASH_TYPES: TrashType[] = ['paper', 'plastic', 'glass', 'organic', 'mixed'];

function randomTrashType(): TrashType {
  if (Math.random() < 0.05) return 'bonus';
  return TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
}

function spawnTrash(count: number): TrashItem[] {
  const items: TrashItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: `trash_${i}_${Date.now()}`,
      type: randomTrashType(),
      pos: {
        x: 60 + Math.random() * (CANVAS_WIDTH - 120),
        y: 60 + Math.random() * (CANVAS_HEIGHT - 140),
      },
      velocity: { x: 0, y: 0 },
      alive: false,
      fleeing: false,
    });
  }
  return items;
}

function createBins(): Bin[] {
  const types: TrashType[] = ['paper', 'plastic', 'glass', 'organic', 'mixed'];
  const positions = [
    { x: 60, y: 80 },
    { x: CANVAS_WIDTH - 60 - BIN_WIDTH, y: 80 },
    { x: 60, y: CANVAS_HEIGHT / 2 - BIN_HEIGHT / 2 },
    { x: CANVAS_WIDTH - 60 - BIN_WIDTH, y: CANVAS_HEIGHT / 2 - BIN_HEIGHT / 2 },
    { x: CANVAS_WIDTH / 2 - BIN_WIDTH / 2, y: CANVAS_HEIGHT - BIN_HEIGHT - 8 },
  ];
  return types.map((type, i) => ({
    type: type as any,
    pos: positions[i],
    width: BIN_WIDTH,
    height: BIN_HEIGHT,
  }));
}

const OBSTACLE_COUNT = 8;

function spawnObstacles(): Obstacle[] {
  const obstacles: Obstacle[] = [];
  for (let i = 0; i < OBSTACLE_COUNT; i++) {
    const type = Math.random() < 0.5 ? 'bush' : 'tree';
    const w = type === 'tree' ? 32 : 40;
    const h = type === 'tree' ? 40 : 28;
    obstacles.push({
      pos: {
        x: 80 + Math.random() * (CANVAS_WIDTH - 160),
        y: 80 + Math.random() * (CANVAS_HEIGHT - 200),
      },
      width: w,
      height: h,
      type,
    });
  }
  return obstacles;
}

function collidesWithObstacles(x: number, y: number, halfW: number, halfH: number, obstacles: Obstacle[]): Obstacle | null {
  for (const obs of obstacles) {
    if (
      x + halfW > obs.pos.x &&
      x - halfW < obs.pos.x + obs.width &&
      y + halfH > obs.pos.y &&
      y - halfH < obs.pos.y + obs.height
    ) {
      return obs;
    }
  }
  return null;
}

const NPC_EMOJIS = ['🚶', '🧑', '👤'];

function randomTarget(): { x: number; y: number } {
  return {
    x: 60 + Math.random() * (CANVAS_WIDTH - 120),
    y: 80 + Math.random() * (CANVAS_HEIGHT - 200),
  };
}

function spawnNPCs(count: number): NPC[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `npc_${i}`,
    pos: { x: Math.random() * CANVAS_WIDTH, y: 80 + Math.random() * (CANVAS_HEIGHT - 200) },
    targetPos: randomTarget(),
    dropTimer: Math.floor(Math.random() * NPC_DROP_INTERVAL),
    emoji: NPC_EMOJIS[i % NPC_EMOJIS.length],
    stunTimer: 0,
  }));
}

export function createInitialState(city: CityConfig): GameState {
  const inv = loadInventory();
  const hasShield = inv.equippedShield !== 'none';
  return {
    player: {
      pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      direction: 'down',
      carrying: [],
      maxCarry: BAG_CAPACITY[inv.equippedBag],
      stunTimer: 0,
      animFrame: 0,
      pickupRange: TOOL_RANGES[inv.equippedTool],
      shieldCooldown: 0,
      weaponCooldown: 0,
    },
    trashItems: spawnTrash(city.trashCount),
    npcs: spawnNPCs(NPC_COUNT),
    bins: createBins(),
    obstacles: spawnObstacles(),
    score: 0,
    correctDrops: 0,
    wrongDrops: 0,
    timeLeft: GAME_DURATION,
    phase: 'calm',
    city,
    paused: false,
    gameOver: false,
    phaseMessage: null,
    phaseMessageTimer: 0,
  };
}

export type KeyState = Record<string, boolean>;

function getPhase(elapsed: number): GamePhase {
  if (elapsed >= PHASE_THRESHOLDS.chaos) return 'chaos';
  if (elapsed >= PHASE_THRESHOLDS.attack) return 'attack';
  if (elapsed >= PHASE_THRESHOLDS['strong-wind']) return 'strong-wind';
  if (elapsed >= PHASE_THRESHOLDS['light-wind']) return 'light-wind';
  return 'calm';
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function updateGame(state: GameState, keys: KeyState, dt: number): GameState {
  if (state.paused || state.gameOver) return state;

  const s = { ...state };
  s.player = { ...s.player, pos: { ...s.player.pos } };
  s.trashItems = s.trashItems.map(t => ({ ...t, pos: { ...t.pos }, velocity: { ...t.velocity } }));
  s.npcs = s.npcs.map(n => ({ ...n, pos: { ...n.pos }, targetPos: { ...n.targetPos } }));

  // Timer (called every frame at ~60fps, dt=1)
  // We decrement timeLeft in the component via setInterval

  // Phase
  const elapsed = GAME_DURATION - s.timeLeft;
  const newPhase = getPhase(elapsed);
  if (newPhase !== s.phase) {
    s.phase = newPhase;
    const messages: Record<GamePhase, string> = {
      calm: '',
      'light-wind': '🌬️ Szél erősödik!',
      'strong-wind': '💨 Erős szél fúj!',
      attack: '☠️ A szemetek támadnak!',
      chaos: '🔥 KÁOSZ MÓD!',
    };
    s.phaseMessage = messages[newPhase];
    s.phaseMessageTimer = 120;
  }

  if (s.phaseMessageTimer > 0) {
    s.phaseMessageTimer -= 1;
  }

  // Shield cooldown
  if (s.player.shieldCooldown > 0) {
    s.player.shieldCooldown -= 1;
  }
  if (s.player.weaponCooldown > 0) {
    s.player.weaponCooldown -= 1;
  }

  // Player movement
  if (s.player.stunTimer > 0) {
    s.player.stunTimer -= 1;
  } else {
    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) { dy = -1; s.player.direction = 'up'; }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) { dy = 1; s.player.direction = 'down'; }
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) { dx = -1; s.player.direction = 'left'; }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) { dx = 1; s.player.direction = 'right'; }

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      const newX = s.player.pos.x + (dx / len) * PLAYER_SPEED;
      const newY = s.player.pos.y + (dy / len) * PLAYER_SPEED;

      // Check obstacle collision before moving
      const halfP = PLAYER_SIZE / 2;
      if (!collidesWithObstacles(newX, newY, halfP, halfP, s.obstacles)) {
        s.player.pos.x = newX;
        s.player.pos.y = newY;
      }
      s.player.animFrame += 1;
    }

    // Clamp
    s.player.pos.x = Math.max(PLAYER_SIZE / 2, Math.min(CANVAS_WIDTH - PLAYER_SIZE / 2, s.player.pos.x));
    s.player.pos.y = Math.max(40 + PLAYER_SIZE / 2, Math.min(CANVAS_HEIGHT - PLAYER_SIZE / 2, s.player.pos.y));
  }

  // Wind effect on trash - direction changes every 10 seconds
  const windSpeed = (WIND_SPEEDS[s.phase] || 0) * s.city.windMultiplier;
  const windPeriod = Math.floor(elapsed / 10);
  const windAngle = ((windPeriod * 7919) % 628) / 100; // deterministic pseudo-random angle per period
  s.trashItems.forEach(trash => {
    if (windSpeed > 0) {
      trash.velocity.x += Math.cos(windAngle) * windSpeed * 0.05;
      trash.velocity.y += Math.sin(windAngle) * windSpeed * 0.05;
    }

    // Attack behavior
    if (s.phase === 'attack' || s.phase === 'chaos') {
      trash.alive = true;
      const d = dist(trash.pos, s.player.pos);
      const speed = 0.8 * s.city.attackMultiplier * (s.phase === 'chaos' ? 1.5 : 1);

      if (d < PLAYER_SIZE / 2 + TRASH_SIZE / 2 + 5) {
        // Very close - bounce off after hitting, don't just sit there
        const angle = Math.atan2(trash.pos.y - s.player.pos.y, trash.pos.x - s.player.pos.x);
        trash.velocity.x += Math.cos(angle) * speed * 0.6;
        trash.velocity.y += Math.sin(angle) * speed * 0.6;
        trash.fleeing = true;
        // Stun check - shield blocks it
        if (s.player.stunTimer <= 0) {
          const inv = loadInventory();
          if (inv.equippedShield !== 'none' && s.player.shieldCooldown <= 0) {
            // Shield blocks the hit, start cooldown
            s.player.shieldCooldown = SHIELD_COOLDOWN_FRAMES;
          } else {
            s.player.stunTimer = STUN_DURATION;
          }
        }
      } else if (d < 60 && s.player.carrying.length === 0) {
        // Flee when player is close and not carrying (can pick them up)
        const angle = Math.atan2(trash.pos.y - s.player.pos.y, trash.pos.x - s.player.pos.x);
        trash.velocity.x += Math.cos(angle) * speed * 0.1;
        trash.velocity.y += Math.sin(angle) * speed * 0.1;
        trash.fleeing = true;
      } else {
        // Approach player to attack
        const angle = Math.atan2(s.player.pos.y - trash.pos.y, s.player.pos.x - trash.pos.x);
        trash.velocity.x += Math.cos(angle) * speed * 0.06;
        trash.velocity.y += Math.sin(angle) * speed * 0.06;
        trash.fleeing = false;
      }
    } else {
      trash.alive = false;
      trash.fleeing = false;
    }

    // Apply velocity with friction
    trash.pos.x += trash.velocity.x;
    trash.pos.y += trash.velocity.y;
    trash.velocity.x *= 0.95;
    trash.velocity.y *= 0.95;

    // Clamp trash to bounds
    trash.pos.x = Math.max(TRASH_SIZE, Math.min(CANVAS_WIDTH - TRASH_SIZE, trash.pos.x));
    trash.pos.y = Math.max(40 + TRASH_SIZE, Math.min(CANVAS_HEIGHT - BIN_HEIGHT - TRASH_SIZE - 10, trash.pos.y));

    // Bounce off obstacles
    const halfT = TRASH_SIZE / 2;
    const hitObs = collidesWithObstacles(trash.pos.x, trash.pos.y, halfT, halfT, s.obstacles);
    if (hitObs) {
      // Push trash out and reverse velocity
      const obsCX = hitObs.pos.x + hitObs.width / 2;
      const obsCY = hitObs.pos.y + hitObs.height / 2;
      const angle = Math.atan2(trash.pos.y - obsCY, trash.pos.x - obsCX);
      trash.pos.x = obsCX + Math.cos(angle) * (hitObs.width / 2 + halfT + 2);
      trash.pos.y = obsCY + Math.sin(angle) * (hitObs.height / 2 + halfT + 2);
      trash.velocity.x *= -0.5;
      trash.velocity.y *= -0.5;
    }
  });

  // NPC movement & littering
  s.npcs.forEach(npc => {
    // Stun countdown
    if (npc.stunTimer > 0) {
      npc.stunTimer -= 1;
      return; // Skip movement and dropping while stunned
    }

    const dx = npc.targetPos.x - npc.pos.x;
    const dy = npc.targetPos.y - npc.pos.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 5) {
      npc.targetPos = randomTarget();
    } else {
      const newNX = npc.pos.x + (dx / d) * NPC_SPEED;
      const newNY = npc.pos.y + (dy / d) * NPC_SPEED;
      if (!collidesWithObstacles(newNX, newNY, 10, 10, s.obstacles)) {
        npc.pos.x = newNX;
        npc.pos.y = newNY;
      } else {
        npc.targetPos = randomTarget();
      }
    }
    npc.dropTimer -= 1;
    if (npc.dropTimer <= 0) {
      npc.dropTimer = NPC_DROP_INTERVAL + Math.floor(Math.random() * 60);
      s.trashItems.push({
        id: `npc_trash_${Date.now()}_${Math.random()}`,
        type: randomTrashType(),
        pos: { x: npc.pos.x, y: npc.pos.y },
        velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
        alive: false,
        fleeing: false,
      });
    }
  });

  // Chaos spawn
  if (s.phase === 'chaos' && Math.random() < 0.005) {
    s.trashItems.push({
      id: `trash_spawn_${Date.now()}_${Math.random()}`,
      type: randomTrashType(),
      pos: {
        x: 60 + Math.random() * (CANVAS_WIDTH - 120),
        y: 60 + Math.random() * (CANVAS_HEIGHT - 140),
      },
      velocity: { x: 0, y: 0 },
      alive: true,
      fleeing: false,
    });
  }

  // Handle Space action - try drop first (if near bin), then pickup
  if (keys['space_action']) {
    let dropped = false;

    // Try to drop into nearby bin first
    if (s.player.carrying.length > 0 && s.player.stunTimer <= 0) {
      for (const bin of s.bins) {
        const binCenter = { x: bin.pos.x + BIN_WIDTH / 2, y: bin.pos.y + BIN_HEIGHT / 2 };
        if (dist(s.player.pos, binCenter) < DROP_RANGE) {
          const kept: TrashType[] = [];
          for (const item of s.player.carrying) {
            if (item === 'bonus') {
              s.score += SCORE_BONUS;
              s.correctDrops += 1;
            } else if (item === bin.type) {
              s.score += SCORE_CORRECT;
              s.correctDrops += 1;
            } else {
              kept.push(item);
            }
          }
          s.player.carrying = kept;
          dropped = true;
          break;
        }
      }
    }

    // If didn't drop, try to pick up (even if already carrying some)
    if (!dropped && s.player.carrying.length < s.player.maxCarry && s.player.stunTimer <= 0) {
      const inRange = s.trashItems
        .map(t => ({ item: t, d: dist(t.pos, s.player.pos) }))
        .filter(({ d }) => d < s.player.pickupRange)
        .sort((a, b) => a.d - b.d);

      const pickedIds: string[] = [];
      const newCarrying = [...s.player.carrying];
      for (const { item } of inRange) {
        if (newCarrying.length >= s.player.maxCarry) break;
        newCarrying.push(item.type);
        pickedIds.push(item.id);
      }
      if (pickedIds.length > 0) {
        s.player.carrying = newCarrying;
        s.trashItems = s.trashItems.filter(t => !pickedIds.includes(t.id));
      }
    }
    keys['space_action'] = false;
  }

  // Handle E key - weapon (taser) usage
  if (keys['weapon_action']) {
    const inv = loadInventory();
    if (inv.equippedWeapon !== 'none' && s.player.weaponCooldown <= 0) {
      const range = WEAPON_RANGE[inv.equippedWeapon];
      s.npcs.forEach(npc => {
        if (dist(s.player.pos, npc.pos) < range) {
          npc.stunTimer = WEAPON_STUN_DURATION;
        }
      });
      s.player.weaponCooldown = WEAPON_COOLDOWN;
    }
    keys['weapon_action'] = false;
  }

  // Check game over - only when time runs out
  if (s.timeLeft <= 0) {
    s.gameOver = true;
  }

  return s;
}

export function calculateStars(state: GameState): number {
  const total = state.correctDrops + state.wrongDrops;
  if (total === 0) return 0;
  const accuracy = state.correctDrops / total;
  const collected = state.correctDrops;
  const trashGoal = state.city.trashCount;

  if (accuracy >= 0.9 && collected >= trashGoal * 0.8) return 3;
  if (accuracy >= 0.7 && collected >= trashGoal * 0.5) return 2;
  if (collected >= 3) return 1;
  return 0;
}
