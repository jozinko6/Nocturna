# Ekonomika — Nocturna

## 1. Prehľad

Ekonomika Nocturny je navrhnutá tak, aby bola **udržateľná**, **antideflačná** a ** férová** pre free-to-play aj platiacich hráčov.

---

## 2. Meny

### 2.1 Gold (základná mena)

| Parametre | Hodnota |
|---|---|
| Symbol | G |
| Max balanc | 999,999,999 |
| Zdroje | Výpravy, PvP, denné úlohy, úkryt, predaj predmetov |
| Použitie | Tréning, obchodník, upgrade úkrytu, opravy |

### 2.2 Nočné kryštály (premium mena)

| Parametre | Hodnota |
|---|---|
| Symbol | NK |
| Max balanc | 999,999 |
| Zdroje | Denná odmena (1 mesačne), membership, nákup za reálne peniaze |
| Použitie | Premium shop, zrýchlenie upgrade, Nočný patrón membership |

---

## 3. Zdroje príjmu

### 3.1 Gold

| Zdroj | Priemerný príjem | Frequency |
|---|---|---|
| Výprava (Mesto) | 15–40 G | Každá výprava (10 energie) |
| Výprava (Čierny les) | 35–80 G | Každá výprava (15 energie) |
| Výprava (Krypty) | 60–150 G | Každá výprava (20 energie) |
| Výprava (Vrchy) | 100–200 G | Každá výprava (25 energie) |
| PvP výhra | 20–40 G | Max 20-krát denne |
| Denné úlohy | 15–50 G | 3–5 úloh denne |
| Predaj predmetov | 5–200 G | Podľa rarity |
| Úkryt (Sklad) | 10–50 G | Pasívne, každú hodinu |

### 3.2 Nočné kryštály

| Zdroj | Množstvo | Frequency |
|---|---|---|
| Denná odmena (deň 4) | 2 NK | Raz za týždeň |
| Denná odmena (deň 6) | 5 NK | Raz za týždeň |
| Denná odmena (deň 7) | 10 NK | Raz za týždeň |
| 30-denný streak | 1 NK | Raz mesačne |
| Nočný patrón | 30 NK | Mesačne |
| Nákup (real money) | Podľa balíka | Podľa potreby |

---

## 4. Zdroje výdavkov

### 4.1 Gold výdavky

| Účel | Náklady | Poznámka |
|---|---|---|
| Tréning atribútov | `50 × level^1.65` | Hlavný gold sink |
| Upgrade úkrytu | 150–1000 G / level | Stupňujúce sa náklady |
| Nákup u obchodníka | 50–1500 G | Podľa rarity |
| Denná odmena | 0 G | Zadarmo |
| Oprava vybavenia | 10–100 G | Podľa rarity (post-MVP) |

### 4.2 Tréning — Detailný výpočet

```
baseCost = 50
attributeLevel = aktuálna úroveň atribútu (1–50)
cost = baseCost × attributeLevel^1.65
```

| Level atribútu | Cena tréningu |
|---|---|
| 1 | 50 G |
| 5 | 148 G |
| 10 | 355 G |
| 15 | 617 G |
| 20 | 933 G |
| 25 | 1,300 G |
| 30 | 1,718 G |
| 35 | 2,185 G |
| 40 | 2,699 G |
| 45 | 3,259 G |
| 50 | 3,863 G |

**Celkové náklady na maxovanie jedného atribútu:** ~52,000 G

---

## 5. Predajne ceny (Item Templates)

### 5.1 Gold predajne

| Rarity | Nákupná cena | Predajná cena | Pomer |
|---|---|---|---|
| Common | 50–200 G | 10–40 G | 20 % |
| Uncommon | 200–500 G | 40–100 G | 20 % |
| Rare | 500–1,500 G | 100–300 G | 20 % |
| Epic | — | 300–750 G | — |
| Legendary | — | 750–2,000 G | — |

### 5.2 Premium predajne

| Rarity | Cena (NK) |
|---|---|
| Uncommon | 5–15 NK |
| Rare | 15–50 NK |
| Epic | 50–150 NK |
| Legendary | 150–500 NK |
| Consumable (elixír) | 1–10 NK |

---

## 6. Merchant rotácia

### 6.1 Mechanika

- **6 slotov** (3 gold + 3 premium)
- **Nočný patrón:** 8 slotov (4 gold + 4 premium)
- **Refresh:** Každých 24 hodín (00:00 UTC)
- **Manuálny refresh:** 5 NK (zakúpiť nový set položiek)

### 6.2 Generovanie

- Náhodný výber z item_templates podľa:
  - Level hráča ±5
  - Rarity weight (common 50%, uncommon 30%, rare 15%, epic 5%)
  - Region (items z aktuálneho regiónu majú +20 % šancu)

---

## 7. Ekonomický ledger

### 7.1 Princíp

**Každá** gold / crystal transakcia je zaznamenaná v `currency_ledger`.

```
currency_ledger:
  character_id | currency | amount | balance_after | source | reference_id | reference_type | description
```

### 7.2 Zdroje transakcií

| source | Popis |
|---|---|
| `expedition` | Odmena za výpravu |
| `training` | Cena tréningu |
| `pvp` | Odmena / cena za PvP |
| `mission` | Odmena za dennú úlohu |
| `shop_buy` | Nákup u obchodníka |
| `shop_sell` | Predaj predmetu |
| `hideout` | Pasívna produkcia úkrytu |
| `daily_reward` | Denná odmena |
| `payment` | Nákup za reálne peniaze |
| `membership` | Nočný patrón bonus |
| `admin` | Admin úprava |
| `upgrade` | Upgrade úkrytu |

### 7.3 Audit

- Každá transakcia má `balance_after` — ľahká validácia
- Admin môže prehľadávať ledger v admin paneli
- Automatická detekcia anomálií (napr. záporný balance, nečakané prírastky)

---

## 8. Anti-inflačné opatrenia

### 8.1 Gold sinks

| Sink | Účel | Efektivita |
|---|---|---|
| **Tréning atribútov** | Exponenciálne rastúce náklady | Vysoká |
| **Upgrade úkrytu** | Stupňujúce sa náklady + čas | Stredná |
| **Obchodník** | Nákup vybavenia | Stredná |
| **Opravy** | Post-MVP: oprava vybavenia | Stredná |

### 8.2 Výpočet Gold sink efektivity

```
Priemerný gold / výprava: ~80 G (mid-game)
Priemerný tréning / deň: ~600 G (5 tréningov × 120 G)
Čistý gold / deň: (príjem - výdavok) = ~400 - 600 = -200 G (deflákcia)
```

### 8.3 Monitorovanie

- Admin panel zobrazuje:
  - Priemerný gold balance per level
  - Gold inflácia (celkový gold v obehu / počet hráčov)
  - Top gold držiteli
  - Denný gold flow (príjem vs. výdavok)

---

## 9. Premium ekonomika

### 9.1 Balíky Nočných kryštálov

| Balík | Kryštály | Cena | Cena / NK |
|---|---|---|---|
| Základný | 500 | 2.99 € | 0.006 € |
| Stredný | 1,100 | 5.99 € | 0.005 € |
| Veľký | 2,400 | 11.99 € | 0.005 € |
| Prémiový | 5,200 | 23.99 € | 0.0046 € |
| Megabalík | 11,000 | 47.99 € | 0.0044 € |

### 9.2 Nočný patrón (Membership)

| Cena | 4.99 € / mesiac |
|---|---|
| Bonus | +25 max energia |
| Bonus | +2 denné sloty v obchodníkovi |
| Bonus | -50 % upgrade čas v úkryte |
| Bonus | +20 % XP z výprav |
| Bonus | 30 NK mesačne |
| Bonus | Exkluzívny avatar (post-MVP) |

### 9.3 Čo sa NESMIE predávať za premium

| Zakázané | Dôvod |
|---|---|
| Priame stat boosty | Pay-to-win |
| Exklívne predmety s lepšími štatistikami | Pay-to-win |
| Gold za premium | Inflácia |
| Energy refill | Pay-to-win (energia = progresia) |
| PvP výhody | Pay-to-win |

### 9.4 Čo SA SMIE predávať za premium

| Povolené | Príklad |
|---|---|
| Cosmetické predmety | Avatary, frame okolo mena |
| Convenience | Zrýchlenie upgrade, extra inventory sloty |
| Kozmetické efekty | Trail za postavou, particle efekty |
| Membership | Nočný patrón |

---

## 10. Ekonomická rovnováha

### 10.1 Cieľové pomery

| Metrika | Cieľ |
|---|---|
| Gold : NK conversion rate | 100 G : 1 NK (implicitný) |
| Priemerný gold balance (Lv. 25) | 5,000–15,000 G |
| Priemerný gold / deň (mid-game) | 400–600 G |
| Gold sink / deň | 500–700 G |
| Net gold flow | -100 až +100 G / deň (stabilný) |

### 10.2 Inflačné alarmy

| Podmienka | Akcia |
|---|---|
| Priemerný gold balance > 50,000 G (Lv. 25) | Zvýšiť tréning náklady |
| Gold inflácia > 20 % / mesiac | Pridať gold sink |
| Gold deflácia < -10 % / mesiac | Zvýšiť gold odmeny |
| NK v obehu > 10,000 / hráč | Obmedziť NK distribúciu |

### 10.3 Admin nástroje

- **Economy dashboard** v admin paneli
- **Manual gold adjustment** (s audit logom)
- **Economy config** (adjustable cez admin panel)
  - `training_base_cost`
  - `energy_regen_seconds`
  - `xp_multiplier`
  - `gold_multiplier`

---

## 11. Transakčná bezpečnosť

### 11.1 Idempotentita

- Každá platba má `stripe_payment_id` (unique)
- Nákup sa spracuje len raz (UNIQUE constraint)
- Webhook retry je bezpečný (idempotent)

### 11.2 Ledger integrity

- Každá transakcia má `balance_after`
- Automatická validácia: `prev_balance + amount = balance_after`
- Admin alert pri nesúlade

### 11.3 Fraud heuristics

| Podmienka | Akcia |
|---|---|
| > 5 nákupov za hodinu | Flag pre review |
| Nákup z novej IP + veľký balík | Flag pre review |
| Rýchle gold prírastky (> 10,000 G / hodinu) | Auto-flag |
| Podivné purchase patterns | Auto-flag |
