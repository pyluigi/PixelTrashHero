import { useNavigate } from 'react-router-dom';

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Pixel art title */}
      <div className="mb-8 text-center">
        <h1 className="pixel-text mb-2 text-2xl text-primary md:text-4xl">
          🗑️ PIXEL TRASH
        </h1>
        <h2 className="pixel-text text-lg text-secondary md:text-2xl">
          HERO
        </h2>
      </div>

      {/* Animated trash icons */}
      <div className="mb-12 flex gap-4 text-3xl">
        <span className="animate-pixel-bounce" style={{ animationDelay: '0s' }}>📰</span>
        <span className="animate-pixel-bounce" style={{ animationDelay: '0.1s' }}>🧴</span>
        <span className="animate-pixel-bounce" style={{ animationDelay: '0.2s' }}>🍾</span>
        <span className="animate-pixel-bounce" style={{ animationDelay: '0.3s' }}>🍎</span>
        <span className="animate-pixel-bounce" style={{ animationDelay: '0.4s' }}>⭐</span>
      </div>

      {/* Menu buttons */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/select')}
          className="pixel-text pixel-shadow rounded border-2 border-primary bg-primary px-8 py-4 text-sm text-primary-foreground transition-all hover:brightness-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          🎮 JÁTÉK INDÍTÁSA
        </button>

        <button
          onClick={() => navigate('/shop')}
          className="pixel-text pixel-shadow rounded border-2 border-secondary bg-secondary px-8 py-3 text-sm text-secondary-foreground transition-all hover:brightness-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          🏪 BOLT
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('pixelTrashHero_save');
            localStorage.removeItem('pixelTrashHero_inventory');
            window.location.reload();
          }}
          className="pixel-text pixel-shadow rounded border-2 border-destructive bg-destructive px-8 py-3 text-xs text-destructive-foreground transition-all hover:brightness-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          🔄 HALADÁS TÖRLÉSE
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-12 max-w-md rounded border border-border bg-card p-4 text-center">
        <p className="pixel-text mb-2 text-xs text-secondary">IRÁNYÍTÁS</p>
        <p className="pixel-text text-[10px] leading-5 text-muted-foreground">
          WASD / Nyilak = Mozgás<br />
          SPACE = Felvétel / Ledobás
        </p>
      </div>

      <p className="mt-6 pixel-text text-[8px] text-muted-foreground animate-blink">
        NYOMJ JÁTÉK INDÍTÁSA-T!
      </p>
    </div>
  );
};

export default MainMenu;
