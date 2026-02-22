import {
  TRASH_COLORS, BIN_COLORS, CANVAS_WIDTH, CANVAS_HEIGHT,
  PLAYER_SIZE, TRASH_SIZE, BIN_WIDTH, BIN_HEIGHT, TRASH_LABELS, BIN_LABELS
} from './constants';
import { GameState, TrashItem, Bin, Player, GamePhase, NPC, Obstacle } from './types';

function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
  // pixel border
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, w - 1, h - 1);
}

function drawCityBackground(ctx: CanvasRenderingContext2D, state: GameState) {
  // Base ground
  ctx.fillStyle = state.city.bgColor;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grid pattern (road/sidewalk)
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let x = 0; x < CANVAS_WIDTH; x += 32) {
    for (let y = 0; y < CANVAS_HEIGHT; y += 32) {
      if ((x / 32 + y / 32) % 2 === 0) {
        ctx.fillRect(x, y, 32, 32);
      }
    }
  }

  // Simple landmark silhouettes based on city
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  const { id } = state.city;
  if (id === 'budapest') {
    // Bridge arches
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(200 + i * 200, 580, 40, Math.PI, 0);
      ctx.fill();
    }
    // Tram tracks
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 560, CANVAS_WIDTH, 4);
    ctx.fillRect(0, 568, CANVAS_WIDTH, 4);
  } else if (id === 'paris') {
    // Eiffel tower silhouette
    ctx.beginPath();
    ctx.moveTo(680, 580);
    ctx.lineTo(720, 400);
    ctx.lineTo(760, 580);
    ctx.fill();
    ctx.fillRect(690, 480, 60, 6);
  } else if (id === 'newyork') {
    // Skyscrapers
    for (let i = 0; i < 5; i++) {
      const h = 80 + Math.sin(i * 2.5) * 40;
      ctx.fillRect(620 + i * 35, 580 - h, 28, h);
    }
  } else if (id === 'tokyo') {
    // Torii gate
    ctx.fillStyle = 'rgba(233,69,96,0.3)';
    ctx.fillRect(100, 520, 8, 60);
    ctx.fillRect(160, 520, 8, 60);
    ctx.fillRect(90, 520, 88, 8);
    ctx.fillRect(95, 535, 78, 6);
  } else if (id === 'london') {
    // Big Ben
    ctx.fillRect(700, 420, 30, 160);
    ctx.fillRect(695, 420, 40, 10);
    ctx.beginPath();
    ctx.moveTo(700, 420);
    ctx.lineTo(715, 390);
    ctx.lineTo(730, 420);
    ctx.fill();
  }
}

function drawWindEffect(ctx: CanvasRenderingContext2D, state: GameState, frameCount: number) {
  const phase = state.phase;
  if (phase === 'calm') return;

  const intensity = phase === 'light-wind' ? 3 : phase === 'strong-wind' ? 8 : phase === 'attack' ? 6 : 12;

  ctx.fillStyle = 'rgba(200,200,200,0.3)';
  for (let i = 0; i < intensity; i++) {
    const seed = (frameCount * 3 + i * 137) % 1000;
    const x = (seed * 0.8 + frameCount * 2) % CANVAS_WIDTH;
    const y = (seed * 0.6 + i * 50) % CANVAS_HEIGHT;
    ctx.fillRect(x, y, 6 + (i % 3) * 2, 2);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, frameCount: number) {
  const { x, y } = player.pos;
  const stunned = player.stunTimer > 0;

  // Body
  const bodyColor = stunned
    ? (frameCount % 10 < 5 ? '#FF6B6B' : '#4ECDC4')
    : '#4ECDC4';
  drawPixelRect(ctx, x - PLAYER_SIZE / 2, y - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE, bodyColor);

  // Eyes based on direction
  ctx.fillStyle = '#1A1A2E';
  const eyeSize = 4;
  const eyeOffset = 5;
  if (player.direction === 'down') {
    ctx.fillRect(x - eyeOffset, y - 2, eyeSize, eyeSize);
    ctx.fillRect(x + eyeOffset - eyeSize, y - 2, eyeSize, eyeSize);
  } else if (player.direction === 'up') {
    ctx.fillRect(x - eyeOffset, y - 4, eyeSize, eyeSize);
    ctx.fillRect(x + eyeOffset - eyeSize, y - 4, eyeSize, eyeSize);
  } else if (player.direction === 'left') {
    ctx.fillRect(x - PLAYER_SIZE / 2 + 2, y - 4, eyeSize, eyeSize);
    ctx.fillRect(x - PLAYER_SIZE / 2 + 2, y + 2, eyeSize, eyeSize);
  } else {
    ctx.fillRect(x + PLAYER_SIZE / 2 - 6, y - 4, eyeSize, eyeSize);
    ctx.fillRect(x + PLAYER_SIZE / 2 - 6, y + 2, eyeSize, eyeSize);
  }

  // Walking animation - bob
  const bob = Math.sin(frameCount * 0.3) * 2;
  if (player.animFrame > 0) {
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x - 4, y + PLAYER_SIZE / 2, 3, 4 + bob);
    ctx.fillRect(x + 1, y + PLAYER_SIZE / 2, 3, 4 - bob);
  }

  // Carrying indicator
  if (player.carrying.length > 0) {
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    const label = player.carrying.map(t => TRASH_LABELS[t]).join('');
    ctx.fillText(label, x, y - PLAYER_SIZE / 2 - 4);
  }
}

function drawTrash(ctx: CanvasRenderingContext2D, trash: TrashItem, frameCount: number) {
  const { x, y } = trash.pos;
  const color = TRASH_COLORS[trash.type];
  const size = TRASH_SIZE;

  drawPixelRect(ctx, x - size / 2, y - size / 2, size, size, color);

  // Emoji label
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(TRASH_LABELS[trash.type], x, y);

  // Alive eyes (attacking phase)
  if (trash.alive) {
    const eyeBob = Math.sin(frameCount * 0.2 + x) * 1;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 5, y - 5 + eyeBob, 4, 4);
    ctx.fillRect(x + 1, y - 5 + eyeBob, 4, 4);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x - 4, y - 4 + eyeBob, 2, 2);
    ctx.fillRect(x + 2, y - 4 + eyeBob, 2, 2);

    // Angry mouth
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x - 3, y + 3, 6, 2);
  }

  // Bonus sparkle
  if (trash.type === 'bonus') {
    const sparkle = Math.sin(frameCount * 0.15) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 255, 100, ${sparkle * 0.6})`;
    ctx.fillRect(x - size / 2 - 2, y - size / 2 - 2, size + 4, size + 4);
  }
}

function drawBin(ctx: CanvasRenderingContext2D, bin: Bin) {
  const color = BIN_COLORS[bin.type];
  drawPixelRect(ctx, bin.pos.x, bin.pos.y, BIN_WIDTH, BIN_HEIGHT, color);

  // Label
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(BIN_LABELS[bin.type], bin.pos.x + BIN_WIDTH / 2, bin.pos.y + BIN_HEIGHT / 2);

  // Type text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px monospace';
  ctx.fillText(bin.type.toUpperCase(), bin.pos.x + BIN_WIDTH / 2, bin.pos.y + BIN_HEIGHT - 6);
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  // Background bar
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 36);

  ctx.font = '14px monospace';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#FFFFFF';

  // Score
  ctx.textAlign = 'left';
  ctx.fillText(`💰 ${state.score}`, 10, 10);

  // Timer
  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  const timeColor = state.timeLeft < 60 ? '#FF4444' : state.timeLeft < 120 ? '#FFAA00' : '#FFFFFF';
  ctx.fillStyle = timeColor;
  ctx.textAlign = 'center';
  ctx.fillText(`⏱️ ${mins}:${secs.toString().padStart(2, '0')}`, CANVAS_WIDTH / 2, 10);

  // Phase
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'right';
  const phaseLabels: Record<GamePhase, string> = {
    calm: '😌 Nyugodt',
    'light-wind': '🌬️ Enyhe szél',
    'strong-wind': '💨 Erős szél',
    attack: '☠️ Támadás!',
    chaos: '🔥 KÁOSZ!',
  };
  ctx.fillText(phaseLabels[state.phase], CANVAS_WIDTH - 10, 10);

  // City name
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = state.city.accentColor;
  ctx.fillText(`🏙️ ${state.city.nameHu}`, 10, 24);

  // Carrying
  if (state.player.carrying.length > 0) {
    ctx.textAlign = 'center';
    ctx.font = '10px monospace';
    const labels = state.player.carrying.map(t => TRASH_LABELS[t]).join('');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Visz: ${labels} (${state.player.carrying.length}/${state.player.maxCarry})`, CANVAS_WIDTH / 2, 24);
  }
}

function drawPhaseMessage(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!state.phaseMessage || state.phaseMessageTimer <= 0) return;

  const alpha = Math.min(1, state.phaseMessageTimer / 30);
  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.7})`;
  ctx.fillRect(CANVAS_WIDTH / 2 - 200, CANVAS_HEIGHT / 2 - 30, 400, 60);

  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.phaseMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

export function render(ctx: CanvasRenderingContext2D, state: GameState, frameCount: number) {
  ctx.imageSmoothingEnabled = false;

  // Background
  drawCityBackground(ctx, state);

  // Wind particles
  drawWindEffect(ctx, state, frameCount);

  // Obstacles
  state.obstacles.forEach(obs => {
    if (obs.type === 'tree') {
      // Trunk
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(obs.pos.x + obs.width / 2 - 4, obs.pos.y + obs.height / 2, 8, obs.height / 2);
      // Foliage
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.arc(obs.pos.x + obs.width / 2, obs.pos.y + obs.height / 3, obs.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(obs.pos.x + obs.width / 2, obs.pos.y + obs.height / 3, obs.width / 2, 0, Math.PI * 2);
      ctx.stroke();
      // Emoji
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌳', obs.pos.x + obs.width / 2, obs.pos.y + obs.height / 3);
    } else {
      // Bush
      ctx.fillStyle = '#388E3C';
      drawPixelRect(ctx, obs.pos.x, obs.pos.y, obs.width, obs.height, '#388E3C');
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌿', obs.pos.x + obs.width / 2, obs.pos.y + obs.height / 2);
    }
  });

  // Bins
  state.bins.forEach(bin => drawBin(ctx, bin));

  // Trash
  state.trashItems.forEach(trash => drawTrash(ctx, trash, frameCount));

  // NPCs
  state.npcs.forEach(npc => {
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (npc.stunTimer > 0) {
      // Stunned effect - flash and show ⚡
      const flash = frameCount % 10 < 5;
      ctx.globalAlpha = flash ? 0.4 : 0.8;
      ctx.fillText('⚡', npc.pos.x, npc.pos.y - 14);
      ctx.fillText(npc.emoji, npc.pos.x, npc.pos.y);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillText(npc.emoji, npc.pos.x, npc.pos.y);
    }
  });

  // Player
  drawPlayer(ctx, state.player, frameCount);

  // HUD
  drawHUD(ctx, state);

  // Phase message overlay
  drawPhaseMessage(ctx, state);

  // Pause overlay
  if (state.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⏸️ SZÜNET', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    ctx.font = '14px monospace';
    ctx.fillText('ESC = Folytatás', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    // Main menu button
    const btnW = 200;
    const btnH = 36;
    const btnX = CANVAS_WIDTH / 2 - btnW / 2;
    const btnY = CANVAS_HEIGHT / 2 + 30;
    ctx.fillStyle = '#E94560';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnW, btnH);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('🏠 FŐMENÜ', CANVAS_WIDTH / 2, btnY + btnH / 2);
  }
}
