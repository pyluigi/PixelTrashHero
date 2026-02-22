

# 🗑️ Pixel Trash Hero – Szemétszedős Játék (Frissített Terv)

## Koncepció
Egy 2D pixel-art stílusú szemétszedős játék, ahol a játékos híres nagyvárosok utcáin szedi össze a szemetet és a megfelelő szelektív kukákba dobja. 10 perces időlimit, erősödő szél és visszatámadó szemetek teszik egyre izgibbé!

---

## 🎮 Alapvető Játékmenet
- **Irányítás:** Nyilak vagy WASD billentyűkkel mozog a karakter felülnézetből (top-down)
- **Cél:** Összeszedni az utcán szétszórt szemetet és a megfelelő színű kukába vinni
- **Időlimit:** Minden pálya **10 perc** – visszaszámláló kijelzéssel
- **Pontozás:** Helyes kukába dobás = pont, rossz kukába = pontlevonás

## ⏱️ Dinamikus Nehézség – Fázisok
### 0–2 perc: Nyugodt fázis
- Szemét mozdulatlanul áll, könnyű összeszedni

### 2–4 perc: Enyhe szél
- Gyenge szél kezdi lassan sodorni a szemetet véletlenszerű irányba
- A szemét csúszkál a pályán, nehezebb elkapni

### 4–5 perc: Erős szél
- A szél felerősödik, a szemét gyorsabban mozog
- Vizuális jelzés: pixeles széleffekt a háttérben

### 5–8 perc: Visszatámadó szemét!
- A szemetek "életre kelnek" – pixeles szemek jelennek meg rajtuk
- Aktívan a játékos felé mozognak és menekülnek, ha közel ér
- Ha egy szemét hozzáér a játékoshoz, rövid lassítás (stun effekt)
- A szél továbbra is fúj

### 8–10 perc: Káosz mód
- Maximális szél + agresszív szemét
- Új szemét is spawnol a pályán
- Utolsó roham – itt kell mindent begyűjteni!

## 🗂️ 5+1 Szeméttípus
1. **Papír** (kék kuka) – újság, doboz, levél
2. **Műanyag** (sárga kuka) – palack, zacskó, pohár
3. **Üveg** (zöld kuka) – üvegpalack, befőttes üveg
4. **Szerves** (barna kuka) – alma, banánhéj, levél
5. **Vegyes** (szürke kuka) – zsebkendő, cigarettacsikk
6. **🌟 Bónusz szemét** (arany) – ritkán jelenik meg, extra pontot ér, bármelyik kukába dobható

## 🏙️ 5 Pálya – Híres Nagyvárosok
1. **Budapest** – Duna-part, villamossínek, Lánchíd háttérben
2. **Párizs** – Eiffel-torony, kávézó teraszok
3. **New York** – Sárga taxik, Central Park
4. **Tokió** – Neon feliratok, szűk utcák
5. **London** – Big Ben, piros telefonfülke

Minden város egyedi pixel-art háttérrel. A későbbi városoknál a szél hamarabb erősödik és a szemét agresszívebb.

## 🖥️ Képernyők
1. **Főmenü** – Pixel-art logó, "Játék indítása" gomb
2. **Városválasztó** – 5 város kártyái, feloldott/zárolt jelzés, csillagok
3. **Játékmező** – Felülnézetes pálya, karakter, szemét, kukák, visszaszámláló, pontszám, aktuális fázis kijelzés (pl. "⚠️ Szél erősödik!", "☠️ Szemetek támadnak!")
4. **Pálya vége** – Eredmény (1-3 csillag), helyes/hibás dobások, "Következő pálya" gomb

## 🎨 Vizuális stílus
- Retro pixel-art grafika (16-bit stílus)
- Színes, vidám hangulat
- Széleffekt animáció (repülő levelek, por)
- Életre kelt szemét: pixeles szemek, dühös arckifejezés
- Fázisváltásnál figyelmeztető felugró üzenet

## ⭐ Előrehaladás
- 1-3 csillag pályánként (idő + pontosság alapján)
- Következő város feloldásához az előzőt teljesíteni kell
- Legjobb pontszám mentése (localStorage)

