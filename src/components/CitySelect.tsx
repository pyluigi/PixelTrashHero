import { useNavigate } from 'react-router-dom';
import { CITIES, CITY_ORDER, loadSave } from '@/game/constants';
import { CityConfig } from '@/game/types';

const CitySelect = () => {
  const navigate = useNavigate();
  const save = loadSave();

  const handleSelect = (city: CityConfig) => {
    if (!save[city.id].unlocked) return;
    navigate(`/game/${city.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 pt-8">
      <h1 className="pixel-text mb-8 text-xl text-primary">🏙️ VÁLASSZ VÁROST</h1>

      <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CITY_ORDER.map((id, idx) => {
          const city = CITIES.find(c => c.id === id)!;
          const progress = save[id];
          const locked = !progress.unlocked;

          return (
            <button
              key={id}
              onClick={() => handleSelect(city)}
              disabled={locked}
              className={`pixel-shadow rounded border-2 p-4 text-left transition-all ${
                locked
                  ? 'cursor-not-allowed border-muted bg-muted opacity-50'
                  : 'border-primary bg-card hover:brightness-110 active:translate-x-1 active:translate-y-1 active:shadow-none'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="pixel-text text-xs text-foreground">
                  {locked ? '🔒' : '🏙️'} {city.nameHu}
                </span>
                <span className="pixel-text text-[10px] text-muted-foreground">
                  #{idx + 1}
                </span>
              </div>

              <div className="mt-2 flex gap-1">
                {[1, 2, 3].map(star => (
                  <span key={star} className="text-lg">
                    {progress.stars >= star ? '⭐' : '☆'}
                  </span>
                ))}
              </div>

              {progress.bestScore > 0 && (
                <p className="pixel-text mt-2 text-[8px] text-secondary">
                  Legjobb: {progress.bestScore} pont
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-1">
                {city.landmarks.map(l => (
                  <span
                    key={l}
                    className="rounded px-1 py-0.5 text-[8px]"
                    style={{ backgroundColor: city.accentColor + '33', color: city.accentColor }}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/')}
        className="pixel-text mt-8 rounded border border-border bg-card px-6 py-2 text-xs text-foreground transition-all hover:bg-muted"
      >
        ← VISSZA
      </button>
    </div>
  );
};

export default CitySelect;
