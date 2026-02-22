import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SHOP_TOOLS, SHOP_BAGS, SHOP_SHIELDS, SHOP_WEAPONS, loadInventory, saveInventory, buyItem, TOOL_RANGES, BAG_CAPACITY } from '@/game/shop';
import { ShopItem, PlayerInventory, ToolId, BagId, ShieldId, WeaponId } from '@/game/types';

const Shop = () => {
  const navigate = useNavigate();
  const [inv, setInv] = useState<PlayerInventory>(loadInventory);

  const handleBuy = (item: ShopItem) => {
    const result = buyItem(inv, item);
    if (result) {
      saveInventory(result);
      setInv(result);
    }
  };

  const handleEquip = (id: string, category: 'tool' | 'bag' | 'shield' | 'weapon') => {
    const next = { ...inv };
    if (category === 'tool') next.equippedTool = id as ToolId;
    else if (category === 'bag') next.equippedBag = id as BagId;
    else if (category === 'shield') next.equippedShield = id as ShieldId;
    else next.equippedWeapon = id as WeaponId;
    saveInventory(next);
    setInv(next);
  };

  const renderItem = (item: ShopItem) => {
    const owned = item.category === 'tool'
      ? inv.ownedTools.includes(item.id as ToolId)
      : item.category === 'bag'
      ? inv.ownedBags.includes(item.id as BagId)
      : item.category === 'shield'
      ? inv.ownedShields.includes(item.id as ShieldId)
      : inv.ownedWeapons.includes(item.id as WeaponId);
    const equipped = item.category === 'tool'
      ? inv.equippedTool === item.id
      : item.category === 'bag'
      ? inv.equippedBag === item.id
      : item.category === 'shield'
      ? inv.equippedShield === item.id
      : inv.equippedWeapon === item.id;
    const canAfford = inv.coins >= item.price;
    const stat = item.category === 'tool'
      ? `Hatótáv: ${TOOL_RANGES[item.id as ToolId]}px`
      : item.category === 'bag'
      ? `Kapacitás: ${BAG_CAPACITY[item.id as BagId]} db`
      : item.category === 'shield'
      ? '10mp cooldown után blokkol'
      : 'E gomb, 15mp cooldown';

    return (
      <div
        key={item.id}
        className={`pixel-shadow rounded border-2 p-4 transition-all ${
          equipped ? 'border-primary bg-primary/10' : owned ? 'border-secondary bg-card' : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.emoji}</span>
          <div>
            <p className="pixel-text text-xs text-foreground">{item.name}</p>
            <p className="pixel-text text-[8px] text-muted-foreground">{item.description}</p>
            <p className="pixel-text text-[8px] text-secondary">{stat}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {owned ? (
            equipped ? (
              <span className="pixel-text text-[10px] text-primary">✅ FELSZERELVE</span>
            ) : (
              <button
                onClick={() => handleEquip(item.id, item.category)}
                className="pixel-text rounded border border-primary bg-primary/20 px-3 py-1 text-[10px] text-primary hover:bg-primary/30"
              >
                FELSZEREL
              </button>
            )
          ) : (
            <button
              onClick={() => handleBuy(item)}
              disabled={!canAfford}
              className={`pixel-text rounded border px-3 py-1 text-[10px] transition-all ${
                canAfford
                  ? 'border-primary bg-primary text-primary-foreground hover:brightness-110'
                  : 'cursor-not-allowed border-muted bg-muted text-muted-foreground opacity-50'
              }`}
            >
              💰 {item.price}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 pt-8">
      <h1 className="pixel-text mb-2 text-xl text-primary">🏪 BOLT</h1>
      <p className="pixel-text mb-8 text-sm text-secondary">💰 {inv.coins} coin</p>

      <div className="w-full max-w-2xl">
        <h2 className="pixel-text mb-4 text-sm text-foreground">🧤 Szedőeszközök</h2>
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {SHOP_TOOLS.map(renderItem)}
        </div>

        <h2 className="pixel-text mb-4 text-sm text-foreground">👜 Zsákok</h2>
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          {SHOP_BAGS.map(renderItem)}
        </div>

        <h2 className="pixel-text mb-4 text-sm text-foreground">🛡️ Védelem</h2>
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          {SHOP_SHIELDS.map(renderItem)}
        </div>

        <h2 className="pixel-text mb-4 text-sm text-foreground">⚡ Fegyverek</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {SHOP_WEAPONS.map(renderItem)}
        </div>
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

export default Shop;
