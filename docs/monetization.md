# Monetizácia — Nocturna

## 1. Prehľad

Nocturna je **free-to-play** hra s **fair monetizáciou**. Žiadny pay-to-win. Premium obsah je obmedzený na cosmety, convenience a membership.

---

## 2. Model

### 2.1 Princípy

| Princíp | Implementácia |
|---|---|
| **Free-to-play** | Hra je hrateľná bez platenia |
| **No pay-to-win** | Premium nekupuje power |
| **Fair pricing** | Žiadne loot boxes, žiadne gambling |
| **Transparentnosť | Všetky ceny sú viditeľné pred nákupom |
| **Respektujúci hráčov** | Žiadne agresívne popupy, žiadne dark patterns |

### 2.2 Čo SA smie predávať

| Kategória | Príklady |
|---|---|
| **Cosmety** | Avatary, frame okolo mena, particle efekty |
| **Convenience** | Extra inventory sloty, zrýchlenie upgrade |
| **Membership** | Nočný patrón (mesačný prístup) |
| **Premium mena** | Nočné kryštály (pre cosmety shop) |

### 2.3 Čo SA NESMIE predávať

| Zakázané | Dôvod |
|---|---|
| Priame stat boosty | Pay-to-win |
| Silnejšie predmety | Pay-to-win |
| Gold za reálne peniaze | Inflácia, pay-to-win |
| Energy refill | Pay-to-win (urýchľuje progresiu) |
| PvP výhody | Pay-to-win |
| Loot boxes | Gambling |
| Gacha mechaniky | Gambling |
| Pay-wall obsah | Hráči musia mať prístup ku všetkému obsahu |

---

## 3. Nočné kryštály — Balíky

### 3.1 Cenník

| Balík | Kryštály | Bonus | Cena | Cena / NK |
|---|---|---|---|---|
| **Základný** | 500 | — | 2.99 € | 0.0060 € |
| **Stredný** | 1,100 | +100 NK | 5.99 € | 0.0054 € |
| **Veľký** | 2,400 | +400 NK | 11.99 € | 0.0050 € |
| **Prémiový** | 5,200 | +1,200 NK | 23.99 € | 0.0046 € |
| **Megabalík** | 11,000 | +3,500 NK | 47.99 € | 0.0044 € |

### 3.2 Bonus kryštály

Bonusové kryštály v väčších balíkoch motivujú k vyšším nákupom:
- Základný: 0 % bonus
- Stredný: +10 % bonus
- Veľký: +20 % bonus
- Prémiový: +30 % bonus
- Megabalík: +47 % bonus

---

## 4. Nočný patrón (Membership)

### 4.1 Cena

| Parametre | Hodnota |
|---|---|
| Cena | 4.99 € / mesiac |
| Platba | Stripe (recurring) |
| Zrušenie | Kedykoľvek, prístup do konca obdobia |

### 4.2 Výhody

| Výhoda | Hodnota |
|---|---|
| +25 max energia | 100 → 125 max |
| +2 sloty v obchodníkovi | 6 → 8 slotov |
| -50 % upgrade čas | 1h → 30 min |
| +20 % XP z výprav | Levelovanie rýchlejšie |
| 30 NK mesačne | Automaticky na začiatku mesiaca |
| Exkluzívny avatar | Post-MVP |
| Exkluzívny frame | Post-MVP |
| Žiadne reklamy | Post-MVP (rewarded ads) |

### 4.3 Ekonomický vplyv

| Metrika | Bez membership | S membership |
|---|---|---|
| Max energia | 100 | 125 |
| Denný XP (priem.) | ~500 | ~600 |
| Denný gold (priem.) | ~500 | ~500 |
| Upgrade čas (level 3) | 3h | 1.5h |
| NK / mesiac | 0–10 | 30 + nákupy |

---

## 5. Denná odmena (free)

Denná odmena je dostupná **všetkým** hráčom, aj bez membershipu.

| Deň | Odmena | Hodnota |
|---|---|---|
| 1 | 20 energia | ~30 min regenerácie |
| 2 | 100 gold | ~2 výpravy |
| 3 | 20 energia + 100 gold | Kombinovaná |
| 4 | 2 Nočné kryštály | ~0.01 € |
| 5 | 30 energia + 200 gold | Vyššia hodnota |
| 6 | 5 Nočných kryštálov | ~0.03 € |
| 7 | 50 energia + 500 gold + 10 NK | ~0.07 € |

**Týždenná hodnota free odmien:** ~42 NK + 800 gold + 120 energie

---

## 6. Rewarded Ads (post-MVP)

### 6.1 Mechanika

- Hráč sa **rozhodne** pozrieť reklamu
- Odmena je **okamžitá** a **garantovaná**
- **Max 5 reklám denne** (10 s Nočným patrónom)
- **Cooldown:** 30 minút medzi reklamami

### 6.2 Typy odmien

| Typ | Odmena |
|---|---|
| Energy boost | +20 energia |
| Double XP | +100 % XP na ďalšiu výpravu |
| Bonus gold | +50 % gold na ďalšiu výpravu |
| Free training | 1 bezplatný tréning |

### 6.3 Etika

- Žiadne强制ne (forced ads) — vždy voluntary
- Žiadne penalty za nepozeranie
- Žiadne pop-upy s reklamami
- Iba v herných momentoch (medzi výpravami)

---

## 7. Stripe integrácia

### 7.1 Fluxus nákupu

```
1. Hráč klikne "Kúpiť kryštály"
2. Zobrazí sa výber balíka
3. Hráč vyberie balík
4. Server vytvorí Stripe Checkout Session
5. Hráč je presmerovaný na Stripe (alebo embedded checkout)
6. Hráč dokončí platbu
7. Stripe odošle webhook na /api/webhooks/stripe
8. Server overí platbu (idempotent)
9. Kryštály sú pripočítané na účet
10. Hráč dostane notifikáciu
```

### 7.2 Webhook spracovanie

| Event | Akcia |
|---|---|
| `checkout.session.completed` | Potvrdenie platby, pripočítanie kryštálov |
| `payment_intent.succeeded` | Backup pre checkout |
| `payment_intent.payment_failed` | Notifikácia hráčovi |
| `customer.subscription.created` | Aktivácia membership |
| `customer.subscription.updated` | Predĺženie membership |
| `customer.subscription.deleted` | Deaktivácia membership |
| `charge.refunded` | Vrátenie kryštálov |

### 7.3 Bezpečnosť

- Webhook overenie cez Stripe signature
- Idempotent spracovanie (unique stripe_payment_id)
- Server-side validácia (nikdy neveriť klientovi)
- Automatické retry (Stripe retry policy)

---

## 8. Analýza monetizácie

### 8.1 Kľúčové metriky

| Metrika | Cieľ (MVP) | Popis |
|---|---|---|
| **Conversion rate** | > 3 % | % hráčov, ktorí niečo kúpia |
| **ARPU** | > 1.50 € | Priemerný výnos na užívateľa |
| **ARPPU** | > 15 € | Priemerný výnos na platiaceho užívateľa |
| **Time to first purchase** | < 48h | Ako rýchlo prvý nákup |
| **Retention (D30)** | > 10 % | Koľko hráčov zostane 30 dní |
| **LTV** | > 10 € | Priemerná lifetime value |
| **Churn after purchase** | < 20 % | % platiacich, ktorí odídu do 7 dní |

### 8.2 Pricing psychológia

| Technika | Implementácia |
|---|---|
| **Anchoring** | Megabalík ako referenčná cena |
| **Value sizing** | Väčšie balíky = lepšia cena / NK |
| **Membership framing** | 4.99 € / mesiac = 0.17 € / deň |
| **Free trial** | Prvý mesiac membership zdarma (post-MVP) |

---

## 9. Daňové a právne

### 9.1 DPH

- Všetky ceny sú **vrátane DPH** (EU)
- Stripe automaticky spracováva DPH
- Faktúry generované cez Stripe

### 9.2 Refundácie

- Refundácie cez Stripe dashboard
- Kryštály sa odobratú po refundácii
- Membership refund = pomerná časť

### 9.3 Vekové obmedzenie

- Hra je pre 13+ (GDPR compliance)
- Deti mladšie ako 13 nemôžu nakupovať
- Parental consent post-MVP

---

## 10. Budúce monetizačné možnosti

| Možnosť | Status | Priorita |
|---|---|---|
| Season Pass | Post-MVP | Vysoká |
| Cosmetický shop | Post-MVP | Vysoká |
| Limited-time balíky | Post-MVP | Stredná |
| Gift kryštály | Post-MVP | Nízka |
| Clan donation | Post-MVP | Nízka |
