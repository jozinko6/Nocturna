# Audit referenčného projektu — Nocturna

## 1. Účel dokumentu

Tento dokument zdokumentuje proces **clean-room implementácie** hry Nocturna. Nocturna je inšpirovaná mechanikami browser RPG žánru (ako je napr. Bitefight, Drakensang, Ikariam), ale je implementovaná ako **úplne originálny projekt** bez kopírovania kódu, asetov alebo chránených prvkov.

---

## 2. Kategórie herných mechaník

Nasledujúce kategórie boli identifikované z referenčných browser RPG projektov a dokumentujeme, ako boli pre Nocturnu upravené.

### 2.1 Postava a atribúty

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| 4–5 atribútov (sila, obratnosť, vitalita, inteligencia, šťastie) | 6 atribútov: Strength, Dexterity, Endurance, Perception, Willpower, Luck | Pridané Perception a Willpower ako samostatné atribúty. Odlišné pomenovanie, odlišný výpočet. |
| Lineárne levelovanie | Exponenciálna XP krivka: `100 × level^1.5` | Odlišný model progresie |
| Štartové atribúty podľa triedy | Štartové atribúty podľa frakcie (Sangvari / Lunari) | Žiadne triedy, len frakcie s mierne odlišnými bonusmi |

### 2.2 Talenty / Schopnosti

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| Strom talentov s pasívnymi a aktívnymi schopnosťami | **Nie je v MVP** — atribúty ovplyvňujú combat priamo | Zámerne zjednodušené pre MVP |
| Active skills s cooldownom | **Nie je v MVP** | Plánované pre Fázu 2 |

### 2.3 Vybavenie (Equipment)

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| 6–8 slotov (zbraň, brnenie, prilba, náramky, náhrdelník, prsteň, opasok, topánky) | 4 sloty: weapon, armor, accessory,consumable | Zjednodušené na 4 sloty |
| Rarity: common → legendary | Rarity: common, uncommon, rare, epic, legendary | Podobné, ale iné drop rates a stat ranges |
| Set bonuses | **Nie je v MVP** | Plánované post-MVP |
| Socket/gem systém | **Nie je v MVP** | Plánované post-MVP |

### 2.4 Lov / Výpravy (Hunting)

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| 1 región s viacerými zone | 4 regióny s unikátnymi nepriateľmi | Odlišný svet, odlišné regióny |
| Automatický boj | Ťažobný boj s max 10 kolami | Viac interaktívny |
| Energetický systém (ako v mnohých hrách) | 100 max, 1/6 min | Iné hodnoty, iné použitie energie |
| Časovo obmedzené výpravy | Nie — výpravy sú instant (spotrebujú energiu) | Zjednodušené |

### 2.5 Misie / Denné úlohy

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| Príbehové misie + denné misie | Iba denné úlohy v MVP | Príbehové misie plánované post-MVP |
| Lineárne misie | Náhodne generované denné úlohy | Odlišný prístup |

### 2.6 Časovo obmedzené aktivity

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| Tréning, hľadanie, práca | Tréning atribútov + časovo obmedzené aktivity | Podobný koncept, iná implementácia |
| Real-time cooldown | Redis-based cooldown tracks | Server-authoritative, nie client-based |

### 2.7 Úkryt (Hideout)

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| 6–10 budov s upgrade | 6 budov s upgrade na 5 levelov | Podobný koncept, odlišné budovy a efekty |
| Pasívna produkcia | Pasívna produkcia + zrýchlená regenerácia | Odlišné bonusy |
| Útoky na úkryt | **Nie je v MVP** | Plánované post-MVP |

### 2.8 Obchodník (Merchant)

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| Náhodný obchod s refresh | 6 slotov, 24h rotácia | Podobný koncept, odlišná rotácia |
| Premium shop | Nočné kryštály shop | Odlišná premium mena |
| Player trading | **Nie je v MVP** | Plánované post-MVP (aukčný dom) |

### 2.9 PvP

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| PvP arena | PvP arena s ELO rating | Podobný koncept, iné hodnoty |
| Rebríčky | Týždenné + celkové rebríčky | Podobné |
| PvP odmeny | XP + gold + sériový bonus | Odlišný systém odmien |

### 2.10 Rebríčky (Rankings)

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| Level-based | ELO rating + level + frakčné | Viac rebríčkov |
| Global + friends | Global + frakčné + týždenné | Odlišná štruktúra |

### 2.11 Klany

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| Klany s leaderom, membermi | **Nie je v MVP** | Plánované pre Fázu 2 |

### 2.12 Správy / Chat

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| Global chat + PM | Systém notifikácií (nie chat) | Odlišný prístup — žiadny real-time chat v MVP |

### 2.13 Ekonomika

| Pôvodná mechanika | Nocturna implementácia | Zmena |
|---|---|---|
| Gold + premium currency | Gold + Nočné kryštály | Odlišné názvy, odlišné ceny |
| Player market | **Nie je v MVP** | Aukčný dom plánovaný post-MVP |
| Gold sinks | Training, hideout upgrades, merchant | Podobné, ale odlišné ceny |

---

## 3. Ignorované časti

Nasledujúce mechaniky z referenčných projektov boli **zámerne ignorované** pre Nocturnu:

| Mechanika | Dôvod ignorovania |
|---|---|
| PvE guild wars | Príliš komplexné pre MVP |
| World boss eventy | Vyžaduje veľkú hráčsku základňu |
| Crafting systém | Plánované post-MVP |
| Mount systém | Kozmetický, nie funkčný v MVP |
| Pet/companion systém | Príliš komplexné pre MVP |
| Housing dekorácie | Nie je priorita |
| Achievements | Plánované post-MVP |
| VIP levels | Nahradené jednoduchým membershipom |
| Loot boxes / gacha | Eticky problematické |
| Energy refill za premium | Premium len za cosmetics a convenience |

---

## 4. Clean-room potvrdenie

### 4.1 Čo NEBLOKované

- **Žiadny kód** nebol kopírovaný z referenčných projektov
- **Žiadne asety** (obrázky, zvuky, animácie) neboli použité
- **Žiadne chránené prvky** (trade marks, copyright content) neboli reprodukované
- **Žiadne databázové schémy** neboli kopírované

### 4.2 Čo BOL implementované

- Všetok kód je **originálny** a napísaný od nuly
- Všetky herné hodnoty (damage formulas, XP curves, pricing) sú **autorsky vypočítané**
- Všetok text a lore je **originálny** (žiadny preklad ani parafráza)
- Všetky UI návrhy sú **originálne** (žiadne kopírovanie layoutov)

### 4.3 Referenčné zdroje (len pre inšpiráciu)

Referenčné projekty boli použité **výhradne na pochopenie žánrových konvencií**:
- Bitefight (browser RPG mechanics overview)
- Drakensang Online (combat flow reference)
- Ikariam (economy and building systems)
- Tribal Wars (progression and clan mechanics)

Žiadny z týchto zdrojov nebol použitý ako priamy zdroj kódu, asetov alebo chráneného obsahu.

### 4.4 Autorské práva

Nocturna je **100 % originálny projekt**. Všetky mechaniky sú implementované ako autorské dielo inšpirované žánrovými konvenciami, nie ako kópia existujúcich diel.

---

## 5. Záver

Audit potvrdzuje, že Nocturna je **clean-room implementácia** browser RPG. Všetky mechaniky boli prebraté z obecnej znalosti žánru a implementované s vlastnými hodnotami, vzormi a rozhodnutiami. Žiadny chránený obsah nebol použitý.
