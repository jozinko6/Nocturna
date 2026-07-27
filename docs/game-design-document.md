# Herný dizajn dokument — Nocturna

## 1. Postava

### 1.1 Vytvorenie postavy

Hráč vytvára postavu s nasledujúcimi voľbami:

| Parameter | Možnosti | Vplyv |
|---|---|---|
| **Meno** | 3–20 znakov, unikátne | Identifikácia |
| **Frakcia** | Sangvari / Lunari | Štartovné bonusy, príbeh |
| **Vzhľad** | 6 avatarov (3 Sangvari, 3 Lunari) | Kozmetický |

### 1.2 Atribúty

Postava má 6 primárnych atribútov. Každý atribút má štartovnú hodnotu závislú od frakcie a môže sa zvyšovať tréningom.

| Atribút | Štart (Sangvari) | Štart (Lunari) | Popis |
|---|---|---|---|
| **Strength** | 8 | 6 | Fyzická sila, určuje attack power |
| **Dexterity** | 6 | 6 | Obratnosť, určuje dodge chance |
| **Endurance** | 7 | 6 | Vytrvalosť, určuje max HP a defense |
| **Perception** | 5 | 7 | Vnímanie, určuje accuracy a critical šancu |
| **Willpower** | 5 | 7 | Vôľa, určuje status effect resist |
| **Luck** | 5 | 5 | Šťastie, určuje loot quality a critical damage |

#### Tréning atribútov

- Cena tréningu: `cost = baseCost × attributeLevel^1.65`
- `baseCost = 50 gold`
- Maximálna úroveň atribútu: 50
- Každé tréningové kolo: +1 atribút (náhodný alebo vybraný)
- Tréning spotrebováva energiu (5 energie za tréning)

### 1.3 Levelovanie

| Parametre | Hodnota |
|---|---|
| XP za výpravu | 20–200 (závisí od regiónu a náročnosti) |
| XP za PvP | 10–50 |
| XP za denné úlohy | 30–80 |
| XP potrebné na level | `xpForLevel = 100 × level^1.5` |
| Max level (MVP) | 50 |
| Bonus za level | +5 HP, +1 všetky atribúty |

---

## 2. Energetický systém

| Parametre | Hodnota |
|---|---|
| Max energia | 100 |
| Regenerácia | 1 energia / 6 minút |
| Plná regenerácia | 10 hodín |
| Spotreba — Výprava | 10–30 (podľa regiónu) |
| Spotreba — PvP | 15 |
| Spotreba — Tréning | 5 |
| Spotreba — Denné úlohy | 5–10 |

### Bonusy k energii

| Zdroj | Bonus |
|---|---|
| Nočný patrón (membership) | +25 max energia |
| Úkryt — Posteľ | +1 energia / 5 minút (namiesto 6) |
| Denná odmena | +20 energia (raz denne) |

---

## 3. PvE — Výpravy

### 3.1 Regióny

#### Mesto bez svitania

| Parametre | Hodnota |
|---|---|
| Level rozsah | 1–15 |
| Spotreba energie | 10 |
| Nepriateľ HP rozsah | 80–200 |
| XP odmena | 20–60 |
| Gold odmena | 15–40 |
| Drop rate (common) | 80 % |
| Drop rate (uncommon) | 15 % |
| Drop rate (rare) | 5 % |
| Popis | Zničené mesto, kde sa potulujú tieňové stvorenía. Prvá línia obrany pred temnotou. |

**Nepriateľia:**
- Tieňový potulník (Lv. 1–5) — slabý, veľa HP
- Krvavý vlk (Lv. 3–8) — rýchly, dodge-focused
- Prízrak minulosti (Lv. 8–15) — silný magic damage

#### Čierny les

| Parametre | Hodnota |
|---|---|
| Level rozsah | 10–30 |
| Spotreba energie | 15 |
| Nepriateľ HP rozsah | 200–600 |
| XP odmena | 50–120 |
| Gold odmena | 35–80 |
| Drop rate (common) | 65 % |
| Drop rate (uncommon) | 25 % |
| Drop rate (rare) | 10 % |
| Frakčný bonus | Sangvari: +10 % damage |
| Popis | Staroveký les, kde svetlo nikdy neprenikne. Sangvari tu kedysi viedli svoje krvavé rituály. |

**Nepriateľia:**
- Lesný duch (Lv. 10–15) — magic damage, silence
- Krvavý elementár (Lv. 15–22) — vysoký HP, regenerácia
- Čierny lovec (Lv. 22–30) — silný, vysoký critical

#### Krypty Prvých

| Parametre | Hodnota |
|---|---|
| Level rozsah | 25–45 |
| Spotreba energie | 20 |
| Nepriateľ HP rozsah | 500–1500 |
| XP odmena | 100–200 |
| Gold odmena | 60–150 |
| Drop rate (common) | 50 % |
| Drop rate (uncommon) | 30 % |
| Drop rate (rare) | 15 % |
| Drop rate (epic) | 5 % |
| Popis | Hrobky prvých obyvateľov tohto sveta. Ich moc je stále živá a nebezpečná. |

**Nepriateľia:**
- Prvý strážca (Lv. 25–32) — vysoká defense, counter-attack
- Kostný mág (Lv. 30–38) — ranged magic, debuffy
- Prastarý drak (Lv. 38–45) — boss-like, veľký HP pool

#### Mesačné vrchy

| Parametre | Hodnota |
|---|---|
| Level rozsah | 40–50 |
| Spotreba energie | 25 |
| Nepriateľ HP rozsah | 1000–3000 |
| XP odmena | 150–200 |
| Gold odmena | 100–200 |
| Drop rate (common) | 40 % |
| Drop rate (uncommon) | 30 % |
| Drop rate (rare) | 20 % |
| Drop rate (epic) | 10 % |
| Frakčný bonus | Lunari: +10 % XP |
| Popis | Vrchy osvietené mesačným svetlom, kde Lunari kedysi budovali svoje observatóriá. |

**Nepriateľia:**
- Mesačný golem (Lv. 40–44) — vysoká defense, magic resist
- Strážca vrchov (Lv. 43–47) — balanced stats
- Mesáčny démon (Lv. 47–50) — endgame boss, multi-phase

### 3.2 Priebeh výpravy

1. Hráč vyberie región
2. Systém generuje encounter (nepriateľ + terrain)
3. Boj prebieha v ťahoch (max 10 kôl)
4. Po víťazstve: odmeny (XP, gold, predmety)
5. Hráč sa môže vrátiť (minie ďalšiu energiu) alebo ukončiť výpravu
6. Výprava sa ukončí po porážke alebo自愿nom odchode

---

## 4. PvP systém

### 4.1 Arena

| Parametre | Hodnota |
|---|---|
| Formát | 1v1, ťažobný |
| Spotreba energie | 15 |
| Rating systém | ELO (štart: 1000) |
| K-factor | 32 |
| Max kôl | 10 |
| Denný limit súbojov | 20 (40 s Nočným patrónom) |

### 4.2 Odmeny za PvP

| Výsledok | XP | Gold |
|---|---|---|
| Výhra | 30–50 | 20–40 |
| Prehra | 10–15 | 5–10 |
| Bonus za sériu výher | +5 XP / výhra (max +25) | +5 gold / výhra (max +25) |

### 4.3 Rebríčky

- **Týždenný:** Reset každý pondelok. Top 100 hráčov dostávajú odmeny
- **Celkový:** Nikdy sa neresetuje
- **Frakčný:** Sangvari vs Lunari — ktorá frakcia má vyšší priemerný rating

---

## 5. Denné úlohy

### 5.1 Generovanie

- Každý deň sa generujú 3–5 náhodných úloh
- Úlohy sa líšia podľa levelu hráča
- Denný reset: 00:00 UTC

### 5.2 Typy úloh

| Typ | Príklad | Odmena |
|---|---|---|
| **Bojová** | Poraz 5 nepriateľov v Čiernom lese | 50 XP, 30 gold |
| **Tréningová** | Natrénuj atribút 3-krát | 40 XP, 20 gold |
| **Preskúmaj** | Dokonči 2 výpravy v akomkoľvek regióne | 60 XP, 40 gold |
| **PvP** | Vyhraj 2 PvP súboje | 70 XP, 50 gold |
| **Zbieraj** | Zberaj 3 predmety akéhokoľvek typu | 30 XP, 15 gold |

### 5.3 Bonus za kompletné plnenie

Ak hráč dokončí **všetky** denné úlohy, získa bonus:
- 100 XP navyše
- 50 gold navyše
- 1 Nočný kryštál (raz mesačne, za 30-denný streak)

---

## 6. Úkryt

### 6.1 Budovy

| Budova | Funkcia | Upgrade náklady |
|---|---|---|
| **Hlavná budova** | Určuje max úroveň ostatných budov | 500 gold + 1000 gold / level |
| **Kováčňa** | Zlepšuje kvalitu vybavenia | 300 gold + 500 gold / level |
| **Lekáreň** | Regenerácia HP medzi bojmi | 200 gold + 400 gold / level |
| **Tréningová oblasť** | Znižuje náklady tréningu o 5 % / level | 400 gold + 600 gold / level |
| **Posteľ** | Zrýchlená regenerácia energie | 250 gold + 350 gold / level |
| **Sklad** | Zväčšuje inventory o 10 slotov / level | 150 gold + 300 gold / level |

### 6.2 Upgrade systém

- Každá budova má max 5 levelov
- Upgrade trvá reálny čas (1h / level pre základné, 4h / level pre pokročilé)
- Nočný patrón: upgrade čas -50 %

---

## 7. Obchodník

### 7.1 Rotácia

- Obchodník má 6 slotov (3 gold, 3 premium)
- Rotácia každých 24 hodín (00:00 UTC)
- Nočný patrón: 8 slotov (4 gold, 4 premium)

### 7.2 Ceny

| Typ | Cena rozsah |
|---|---|
| Common item | 50–200 gold |
| Uncommon item | 200–500 gold |
| Rare item | 500–1500 gold |
| Epic item | 10–50 Nočných kryštálov |
| Legendary item | 50–200 Nočných kryštálov |
| Elixír / Spotrebiteľný | 1–10 Nočných kryštálov |

---

## 8. Denná odmena

| Deň | Odmena |
|---|---|
| 1 | 20 energia |
| 2 | 100 gold |
| 3 | 20 energia + 100 gold |
| 4 | 2 Nočné kryštály |
| 5 | 30 energia + 200 gold |
| 6 | 5 Nočných kryštálov |
| 7 | 50 energia + 500 gold + 10 Nočných kryštálov |

- Cyklus sa opakuje každý týždeň
- Prerušenie = reset na deň 1

---

## 9. Mapa sveta

```
┌─────────────────────────────────────────────┐
│                 Nocturna                      │
│                                               │
│   ┌──────────┐    ┌──────────┐               │
│   │  Mesto   │◄──►│ Čierny   │               │
│   │ bez      │    │ les      │               │
│   │ svitania │    │          │               │
│   └────┬─────┘    └────┬─────┘               │
│        │                │                     │
│        ▼                ▼                     │
│   ┌──────────┐    ┌──────────┐               │
│   │  Krypty  │◄──►│ Mesačné  │               │
│   │ Prvých   │    │ vrchy    │               │
│   └──────────┘    └──────────┘               │
│                                               │
│   [Úkryt] [Obchodník] [Arena]               │
└─────────────────────────────────────────────┘
```

---

## 10. Progression krivka

```
Level 1-10:   Mesto bez svitania (tutorial phase)
Level 10-25:  Čierny les (mid-game)
Level 25-40:  Krypty Prvých (late-mid)
Level 40-50:  Mesačné vrchy (endgame)
              ↕ PvP arena (od levelu 5)
              ↕ Úkryt (od levelu 3)
              ↕ Obchodník (od levelu 1)
```
