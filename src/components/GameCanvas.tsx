import { useRef, useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CITIES, CANVAS_WIDTH, CANVAS_HEIGHT, loadSave, saveSave, CITY_ORDER } from '@/game/constants';
import { createInitialState, updateGame, calculateStars, KeyState } from '@/game/engine';
import { render } from '@/game/renderer';
import { GameState } from '@/game/types';
import { loadInventory, saveInventory } from '@/game/shop';
import GameOver from './GameOver';

const GameCanvas = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<KeyState>({});
  const stateRef = useRef<GameState | null>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [gameOver, setGameOver] = useState(false);
  const [finalState, setFinalState] = useState<GameState | null>(null);

  const city = CITIES.find(c => c.id === cityId);

  useEffect(() => {
    if (!city) {
      navigate('/select');
      return;
    }

    stateRef.current = createInitialState(city);

    // Timer interval - decrease time every second
    const timer = setInterval(() => {
      if (stateRef.current && !stateRef.current.paused && !stateRef.current.gameOver) {
        stateRef.current = { ...stateRef.current, timeLeft: stateRef.current.timeLeft - 1 };
        if (stateRef.current.timeLeft <= 0) {
          stateRef.current.gameOver = true;
        }
      }
    }, 1000);

    // Click handler for pause menu
    const onClick = (e: MouseEvent) => {
      if (!stateRef.current?.paused) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const btnW = 200;
      const btnH = 36;
      const btnX = CANVAS_WIDTH / 2 - btnW / 2;
      const btnY = CANVAS_HEIGHT / 2 + 30;
      if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH) {
        cancelAnimationFrame(rafRef.current);
        navigate('/');
      }
    };

    // Keyboard
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      // Space as one-shot action
      if (e.key === ' ') {
        keysRef.current['space_action'] = true;
      }
      if (e.key === 'e' || e.key === 'E') {
        keysRef.current['weapon_action'] = true;
      }
      // ESC toggle pause
      if (e.key === 'Escape' && stateRef.current) {
        stateRef.current = { ...stateRef.current, paused: !stateRef.current.paused };
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvasRef.current?.addEventListener('click', onClick);

    // Game loop
    const loop = () => {
      if (!stateRef.current) return;

      stateRef.current = updateGame(stateRef.current, keysRef.current, 1);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          render(ctx, stateRef.current, frameRef.current);
        }
      }

      frameRef.current += 1;

      if (stateRef.current.gameOver) {
        setFinalState({ ...stateRef.current });
        setGameOver(true);

        // Save progress
        const stars = calculateStars(stateRef.current);
        const save = loadSave();
        const cid = stateRef.current.city.id;
        if (stateRef.current.score > save[cid].bestScore) {
          save[cid].bestScore = stateRef.current.score;
        }
        if (stars > save[cid].stars) {
          save[cid].stars = stars;
        }
        // Unlock next city if at least 1 star
        if (stars >= 1) {
          const idx = CITY_ORDER.indexOf(cid);
          if (idx < CITY_ORDER.length - 1) {
            save[CITY_ORDER[idx + 1]].unlocked = true;
          }
        }
        saveSave(save);

        // Add earned coins
        if (stateRef.current.score > 0) {
          const inv = loadInventory();
          inv.coins += stateRef.current.score;
          saveInventory(inv);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvasRef.current?.removeEventListener('click', onClick);
    };
  }, [city, navigate]);

  if (!city) return null;

  if (gameOver && finalState) {
    return <GameOver state={finalState} />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-2">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="pixel-shadow rounded border-2 border-border"
        style={{ imageRendering: 'pixelated', maxWidth: '100%' }}
      />
      <p className="pixel-text mt-2 text-[8px] text-muted-foreground">
        WASD/Nyilak = Mozgás | SPACE = Felvétel/Ledobás | E = Sokkoló | ESC = Szünet
      </p>
    </div>
  );
};

export default GameCanvas;
