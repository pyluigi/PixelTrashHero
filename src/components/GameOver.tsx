import { useNavigate } from 'react-router-dom';
import { calculateStars } from '@/game/engine';
import { CITY_ORDER, loadSave } from '@/game/constants';
import { GameState } from '@/game/types';

interface Props {
  state: GameState;
}

const GameOver = ({ state }: Props) => {
  const navigate = useNavigate();
  const stars = calculateStars(state);
  const cityIdx = CITY_ORDER.indexOf(state.city.id);
  const hasNext = cityIdx < CITY_ORDER.length - 1 && stars >= 1;
  const nextCity = hasNext ? CITY_ORDER[cityIdx + 1] : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <h1 className="pixel-text mb-4 text-xl text-primary">🏁 PÁLYA VÉGE</h1>
      <p className="pixel-text mb-2 text-sm text-secondary">{state.city.nameHu}</p>

      {/* Stars */}
      <div className="mb-6 flex gap-2 text-4xl">
        {[1, 2, 3].map(s => (
          <span key={s} className={stars >= s ? 'animate-pixel-bounce' : 'opacity-30'} style={{ animationDelay: `${s * 0.15}s` }}>
            {stars >= s ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-8 rounded border border-border bg-card p-6 text-center">
        <p className="pixel-text mb-2 text-lg text-primary">💰 {state.score} pont</p>
        <p className="pixel-text mb-1 text-xs text-foreground">
          ✅ Helyes dobás: {state.correctDrops}
        </p>
        <p className="pixel-text mb-1 text-xs text-destructive">
          ❌ Hibás dobás: {state.wrongDrops}
        </p>
        <p className="pixel-text text-xs text-muted-foreground">
          🗑️ Maradt: {state.trashItems.length} szemét
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            navigate('/', { replace: true });
            setTimeout(() => navigate(`/game/${state.city.id}`), 0);
          }}
          className="pixel-text pixel-shadow rounded border-2 border-secondary bg-secondary px-6 py-3 text-xs text-secondary-foreground transition-all hover:brightness-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          🔄 ÚJRA
        </button>

        {hasNext && nextCity && (
          <button
            onClick={() => navigate(`/game/${nextCity}`)}
            className="pixel-text pixel-shadow rounded border-2 border-primary bg-primary px-6 py-3 text-xs text-primary-foreground transition-all hover:brightness-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            ➡️ KÖVETKEZŐ VÁROS
          </button>
        )}

        <button
          onClick={() => navigate('/select')}
          className="pixel-text rounded border border-border bg-card px-6 py-2 text-xs text-foreground transition-all hover:bg-muted"
        >
          🏙️ VÁROSVÁLASZTÓ
        </button>

        <button
          onClick={() => navigate('/')}
          className="pixel-text rounded border border-border bg-card px-6 py-2 text-xs text-foreground transition-all hover:bg-muted"
        >
          🏠 FŐMENÜ
        </button>
      </div>
    </div>
  );
};

export default GameOver;
