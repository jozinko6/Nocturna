# Bojový systém — Nocturna

## 1. Prehľad

Bojový systém Nocturny je **ťažobný** (turn-based) s maximálne **10 kolami**. Každé kolo pozostáva z útoku, kontroly zásahu, kritického úderu, úhybu, blokovania, talentu a status efektov. Všetky výpočty prebiehajú na **serveri** s použitím **seeded RNG** pre reprodukovateľnosť.

---

## 2. Derived Stats

### 2.1 Max HP

```
maxHp = 100 + endurance × 18 + level × 12
```

| Endurance | Level | Max HP |
|---|---|---|
| 6 | 1 | 220 |
| 10 | 10 | 392 |
| 15 | 20 | 610 |
| 20 | 30 | 816 |
| 25 | 40 | 1,030 |
| 30 | 50 | 1,250 |
| 50 | 50 | 1,910 |

### 2.2 Attack Power

```
attackPower = weaponDamage + strength × 2.2 + level × 1.5
```

| Weapon | Strength | Level | Attack Power |
|---|---|---|---|
| Päsť | 0 | 1 | 1.5 |
| Železný meč (10 dmg) | 8 | 1 | 29.1 |
| Železný meč (10 dmg) | 15 | 20 | 74.0 |
| Krvavá sekerа (30 dmg) | 25 | 40 | 145.0 |

### 2.3 Defense Power

```
defensePower = armor + endurance × 1.7
```

| Armor | Endurance | Defense Power |
|---|---|---|
| Žiadne (0) | 6 | 10.2 |
| Kožené (15) | 10 | 32.0 |
| Železné (30) | 15 | 55.5 |
| Dračie (50) | 25 | 92.5 |

### 2.4 Accuracy

```
accuracy = clamp(70 + (perception - targetDexterity) × 0.35, 35, 95)
```

| Perception | Target Dex | Accuracy |
|---|---|---|
| 6 | 6 | 70 % |
| 10 | 6 | 71.4 % |
| 6 | 10 | 68.6 % |
| 15 | 6 | 73.15 % |
| 20 | 6 | 74.9 % |

### 2.5 Critical Chance

```
criticalChance = clamp(5 + luck × 0.15, 5, 30)
```

| Luck | Critical Chance |
|---|---|
| 5 | 5.75 % |
| 10 | 6.5 % |
| 15 | 7.25 % |
| 20 | 8.0 % |
| 30 | 9.5 % |
| 50 | 12.5 % |

### 2.6 Dodge Chance

```
dodgeChance = clamp(dexterity × 0.1 - attackerPerception × 0.04, 0, 25)
```

| Dexterity | Attacker Perception | Dodge Chance |
|---|---|---|
| 6 | 6 | 0.36 % |
| 10 | 6 | 0.76 % |
| 15 | 6 | 1.26 % |
| 20 | 6 | 1.76 % |
| 15 | 10 | 1.1 % |
| 20 | 10 | 1.6 % |

### 2.7 Súhrnná tabuľka

| Stat | Formula | Min | Max |
|---|---|---|---|
| Max HP | 100 + END × 18 + LVL × 12 | 130 | 1,910 |
| Attack Power | WeaponDmg + STR × 2.2 + LVL × 1.5 | 1.5 | ~250 |
| Defense Power | Armor + END × 1.7 | 0 | ~140 |
| Accuracy | 70 + (PER - targetDEX) × 0.35 | 35 % | 95 % |
| Critical Chance | 5 + LCK × 0.15 | 5 % | 30 % |
| Dodge Chance | DEX × 0.1 - attackerPER × 0.04 | 0 % | 25 % |

---

## 3. Priebeh kola

```
┌─────────────────────────────────────────┐
│              ZAČIATOK KOLO              │
│                                          │
│  1. Attacker action (AI / player)        │
│  2. Hit check:                           │
│     roll = random(0, 100)               │
│     if roll > accuracy → MISS            │
│  3. If HIT:                              │
│     a. Dodge check:                      │
│        roll = random(0, 100)            │
│        if roll < dodgeChance → DODGE     │
│     b. Block check (defender defends):   │
│        if defender_defends → BLOCK       │
│     c. Critical check:                   │
│        roll = random(0, 100)            │
│        if roll < criticalChance → CRIT   │
│     d. Damage calculation:               │
│        damage = max(1, AP × random(0.9,1.1) - DP × 0.55) │
│        if CRIT → damage × 1.5           │
│        if BLOCK → damage × 0.5          │
│  4. Apply damage to defender HP          │
│  5. Status effect application            │
│  6. Check if defender HP <= 0 → VICTORY  │
│  7. Switch roles (defender attacks)      │
│  8. Repeat for defender                  │
│  9. End of round check:                  │
│     if round >= 10 → DRAW (or higher HP wins) │
└─────────────────────────────────────────┘
```

---

## 4. Damage výpočet

### 4.1 Základný damage

```
baseDamage = max(1, attackPower × random(0.9, 1.1) - defensePower × 0.55)
```

### 4.2 Modifikátory

| Modifikátor | Násobiteľ | Podmienka |
|---|---|---|
| Critical hit | × 1.5 | criticalChance check |
| Block | × 0.5 | defender defends |
| Dodge | × 0 (miss) | dodgeChance check |
| Miss | × 0 | accuracy check |
| Frakčný bonus | × 1.1 | v špecifickom regióne |

### 4.3 Príklad výpočtu

```
Attacker:
  weaponDamage = 30 (Krvavá sekerа)
  strength = 25
  level = 40
  attackPower = 30 + 25 × 2.2 + 40 × 1.5 = 145.0

Defender:
  armor = 20
  endurance = 20
  defensePower = 20 + 20 × 1.7 = 54.0

Base damage = max(1, 145.0 × 1.05 - 54.0 × 0.55)
            = max(1, 152.25 - 29.7)
            = 122.55

If critical: 122.55 × 1.5 = 183.8
If block: 122.55 × 0.5 = 61.3
If both: 183.8 × 0.5 = 91.9
```

---

## 5. Seeded RNG

### 5.1 Účel

Všetky bojové výpočty používajú **seeded random number generator** pre:
- **Reprodukovateľnosť** — rovnaký seed = rovnaký výsledok
- **Audit** — battle report obsahuje seed, možno replay
- **Debugovanie** — identifikácia problémov

### 5.2 Seed generovanie

```
seed = `${characterId}-${encounterId}-${timestamp}`
```

### 5.3 Implementácia

- Mulberry32 alebo podobný seeded PRNG
- Každé kolo generuje nový random value z rovnakého seedu
- Seed je uložený v `battle_reports.seed`

---

## 6. PvP špecifiká

### 6.1 Rozdiely od PvE

| Aspekt | PvE | PvP |
|---|---|---|
| Nepriateľ | AI (NPC) | Iný hráč |
| AI | Náhodná / weighted akcia | — |
| Rating | Žiadny | ELO |
| Odmeny | XP + gold + loot | XP + gold |
| Energy | 10–25 | 15 |
| Denný limit | Žiadny | 20 (40 s membershipom) |

### 6.2 ELO Rating

```
novýRating = starýRating + K × (skóre - očakávané_skóre)
```

| Parametre | Hodnota |
|---|---|
| K-factor | 32 |
| Štartový rating | 1000 |
| Min rating | 100 |
| Max rating | 3000 |
| Očakávané skóre | 1 / (1 + 10^((opponentRating - playerRating) / 400)) |
| Skóre (výhra) | 1.0 |
| Skóre (prehra) | 0.0 |
| Skóre (remíza) | 0.5 |

### 6.3 PvP bojové špecifiká

- Attacker je vždy hráč s nižším ratingom (výhoda domáceho prostredia)
- AI oponentov sa generuje z reálnych postáv (snapshot)
- Oponentove rozhodnutia sú AI-simulované (nie reálny hráč)
- Battle report sa uloží obom hráčom

---

## 7. Nepriateľia (PvE)

### 7.1 Štatistiky nepriateľov

| Nepriateľ | Level | HP | Attack | Defense | Special |
|---|---|---|---|---|---|
| Tieňový potulník | 1–5 | 80–150 | 15–25 | 5–10 | Žiadne |
| Krvavý vlk | 3–8 | 100–200 | 20–35 | 8–15 | Dodge +10 % |
| Prízrak minulosti | 8–15 | 200–400 | 30–50 | 10–20 | Magic damage |
| Lesný duch | 10–15 | 250–450 | 35–55 | 15–25 | Silence (1 kolo) |
| Krvavý elementár | 15–22 | 400–650 | 45–65 | 20–35 | Regen +30 HP/kolo |
| Čierny lovec | 22–30 | 500–800 | 55–80 | 25–40 | Critical +15 % |
| Prvý strážca | 25–32 | 700–1100 | 60–85 | 35–50 | Counter-attack |
| Kostný mág | 30–38 | 600–1000 | 70–95 | 20–35 | Ranged + debuff |
| Prastarý drak | 38–45 | 1500–2500 | 90–130 | 45–65 | Multi-phase |
| Mesačný golem | 40–44 | 1800–2800 | 95–125 | 55–75 | Magic resist |
| Strážca vrchov | 43–47 | 2000–3000 | 100–140 | 50–70 | Balanced |
| Mesáčny démon | 47–50 | 2500–3500 | 120–160 | 60–80 | Multi-phase + drain |

### 7.2 AI správanie nepriateľov

| Typ AI | Správanie |
|---|---|
| **Agresívny** | Vždy útočí, maximálny damage |
| **Defenzívny** | 40 % šanca brániť sa |
| **Balanced** | 70 % útok, 30 % obrana |
| **Boss** | Mení fázy podľa HP (100% → 50% → 25%) |

---

## 8. Status efekty (MVP)

| Efekt | Trvanie | Efekt |
|---|---|---|
| **Silence** | 1 kolo | Blokuje špeciálne útoky |
| **Bleed** | 3 kola | -10 HP na začiatku kola |
| **Regen** | 3 koly | +30 HP na začiatku kola |
| **Weaken** | 2 koly | -15 % attack power |
| **Fortify** | 2 koly | +15 % defense power |

---

## 9. Battle Report

Každý boj generuje detailný report:

```typescript
interface BattleReport {
  id: string;
  characterId: string;
  battleType: 'pve' | 'pvp';
  encounterId?: string;
  pvpOpponentId?: string;
  result: 'victory' | 'defeat' | 'draw';
  roundsPlayed: number;
  xpGained: number;
  goldGained: number;
  itemsGained: Item[];
  energyCost: number;
  seed: string;
  rounds: BattleRound[];
}
```

```typescript
interface BattleRound {
  roundNumber: number;
  attackerAction: 'attack' | 'defend' | 'special';
  defenderAction: 'attack' | 'defend' | 'dodge';
  attackerHp: number;
  defenderHp: number;
  damageDealt: number;
  isCritical: boolean;
  isDodge: boolean;
  isBlock: boolean;
  hit: boolean;
}
```

---

## 10. Balancovanie

### 10.1 Cieľové pomery

| Metrika | Cieľ |
|---|---|
| Priemerný boj (PvE) | 5–7 kôl |
| Priemerný boj (PvP) | 6–8 kôl |
| Win rate (PvE, správny level) | 70–85 % |
| Win rate (PvP, rovnaký rating) | 45–55 % |
| Critical hit feel | ~8–12 % (dostatočne vzácny) |
| Dodge frequency | ~5–10 % (vzácný, ale impactful) |

### 10.2 Testovacie scenáre

| Scenár | Očakávanie |
|---|---|
| Lv. 10 hráč vs. Lv. 5 nepriateľ | Vyhrá v 3–4 kolách |
| Lv. 10 hráč vs. Lv. 15 nepriateľ | Prehrá alebo vyhrá s malým HP |
| Rovnaký level PvP | 50/50 výhra |
| Max level hráč vs. boss | Vyhrá v 7–9 kolách |
