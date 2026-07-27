# Produktová špecifikácia — Nocturna

## 1. Prehľad

**Nocturna** je dark fantasy prehliadačová RPG (browser RPG) založená na ťahovom bojovom systéme, PvE výpravách a PvP súbojoch. Hráči sa pridávajú k jednej z dvoch frakcií, budujú svoju postavu, plnia denné úlohy, skúmajú temné regióny a súperia o dominanciu v rebríčkoch.

| Vlastnosť | Hodnota |
|---|---|
| **Názov** | Nocturna |
| **Žáner** | Dark Fantasy Browser RPG |
| **Platforma** | Web (responsive, desktop + mobile) |
| **Model** | Free-to-play s mikrotransakciami |
| **Jazyk** | Slovenčina (primárny), technické termíny v angličtine |
| **Tech Stack** | Next.js, TypeScript, Tailwind CSS, PostgreSQL, Supabase |

---

## 2. Frakcie

Hráč si na začiatku vyberá jednu z dvoch frakcií. Voľba je **nevratná** a ovplyvňuje štartovné atribúty, príbehové texty a prístup k špecifickým regiónom.

### Sangvari — Krvavý kmeň

- **Téma:** Sila, krv, boj, prežitie
- **Štartovný bonus:** +2 Strength, +1 Endurance
- **Fракcií:** Sangvari získavajú +10 % damage v regióne Čierny les
- **Popis:** Starobylý kmeň bojovníkov, ktorí veria, že krv je zdrojom všetkej moci. Ich rituály sú brutálne, ale účinné. Nosia červené runy a bojujú zblízka.

### Lunari — Mesáčni strážcovia

- **Téma:** Múdrosť, videnie, taktika, mystika
- **Štartovný bonus:** +2 Perception, +1 Willpower
- **Fракciовий бонус:** Lunari získavajú +10 % XP v regióne Mesačné vrchy
- **Popis:** Tajomný rád, ktorý čerpá silu z mesačného svetla. Sú to vizionári a stratégovia, ktorí preferujú taktický prístup pred hrubou silou.

---

## 3. MVP Scope

### 3.1 Cieľová skupina

| Segment | Popis |
|---|---|
| **Hlavný** | Hráči 18–35 rokov, skúsení s browser RPG / idle hrami |
| **Sekundárny** | Casual hráči hľadajúci krátke session (5–15 minút) |
| **Terciálny** | Fanúšikovia dark fantasy estetiky a lore |

### 3.2 MVP Funkcie

#### Postava a progresia

- Vytvorenie postavy s voľbou frakcie (Sangvari / Lunari)
- 6 atribútov: Strength, Dexterity, Endurance, Perception, Willpower, Luck
- Systém levelovania (XP, level cap v MVP: 50)
- Energetický systém (100 max, 1 energie / 6 minút)

#### PvE — Výpravy

- 4 regióny s unikátnymi nepriateľmi a lootom:
  - **Mesto bez svitania** — tutorial / low-level región
  - **Čierny les** — stredná náročnosť, Sangvari bonus
  - **Krypty Prvých** — vysoká náročnosť, endgame loot
  - **Mesačné vrchy** — Lunari bonus, mesačné eventy
- Ťažobný systém s maximálne 10 kolami
- Odmeny: XP, gold, predmety

#### PvP

- Arena súboje (1v1, ťažobný)
- ELO rating systém
- Rebríčky (týždenné / celkové)

#### Denné aktivity

- Denné úlohy (3–5 náhodných)
- Časovo obmedzené aktivity (tréning, hľadanie pokladov)

#### Úkryt

- Osobný úkryt hráča
- Budovy: kováčňa, lekáreň, tréningová oblasť
- Produkcia zdrojov a vylepšenia

#### Obchodník

- Rotujúci obchod s náhodnými predmetmi
- Denný refresh
- Gold + Nočné kryštály (premium)

#### Ekonomika

- Gold (základná mena)
- Nočné kryštály (premium mena)
- Obchod medzi hráčmi: **nie v MVP** (príde neskôr)

### 3.3 Čo NIE je v MVP

| Funkcia | Status |
|---|---|
| Klanový systém | Post-MVP |
| Sezóny a leaderboard reset | Post-MVP |
| Globálne territory wars | Post-MVP |
| Aukčný dom | Post-MVP |
| Globálny chat | Post-MVP |
| Referral systém | Post-MVP |
| Crafting (pokročilý) | Post-MVP |
| Eventy / limited-time | Post-MVP |

---

## 4. Budúce rozšírenia

### Fáza 2 — Komunita

- Klanový systém (vlastnosti, vojny, rebríčky)
- Globálny chat
- Referral / pozývací systém
- Denné denné streak odmeny

### Fáza 3 — Súťaživosť

- Sezóny s mesačným resetom
- Globálne territory wars (frakčné boje)
- Aukčný dom (player-to-player trading)
- Pokročilé PvP turnaje

### Fáza 4 — Rozšírenie sveta

- Nové regióny a príbehové kampane
- Guild wars
- World boss eventy
- Cross-platform (PWA push notifikácie)

---

## 5. Kľúčové metriky (MVP)

| Metrika | Cieľ |
|---|---|
| Day 1 Retention | > 40 % |
| Day 7 Retention | > 20 % |
| Priemerná session dĺžka | 8–15 minút |
| Conversion rate (F2P → platiaci) | > 3 % |
| ARPU (Monthly) | > 1.50 € |
| Time to first purchase | < 48 hodín |

---

## 6. Konkurenčná analýza

| Hra | Silné stránky | Slabé stránky | Nocturna diferenciácia |
|---|---|---|---|
| Bitefight | Overený model, veľká komunita | Zastaralý UI, pay-to-win | Moderný UI, server-authoritative |
| Ikariam | Hlboká stratégia | Pomalý pacing | Rýchlejšie session |
| Tribal Wars | Klanový systém | Grat-to-win | Premium iba cosmety |
| Drakensang Online | AAA grafika | Heavy client | Ľahký browser client |

---

## 7. Riziká a mitigácia

| Riziko | Impact | Mitigácia |
|---|---|---|
| Nízka retencia | Vysoký | Denné úlohy, progresívny obsah |
| Pay-to-win perception | Vysoký | Premium len cosmety + convenience |
| Botting / cheaty | Stredný | Server-authoritative, rate limiting |
| Nízky počet hráčov | Vysoký | AI PvP bota, post-MVP matchmaking |
| Scope creep | Stredný | Strict MVP scope, phased roadmap |
