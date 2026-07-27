# Administrácia — Nocturna

## 1. Prehľad

Admin panel je dostupný na `/admin` a je chránený RBAC (Role-Based Access Control). Každá akcia je auditovaná.

---

## 2. Admin roly

| Role | Popis | Oprávnenia |
|---|---|---|
| **support** | Zákaznícka podpora | Read-only prístup k hráčskym dátam, prezeranie battle reports |
| **moderator** | Moderátor komunity | + Ban/mute hráčov, obsahová moderácia |
| **economy_manager** | Ekonomický manažér | + Úprava ekonomiky, item pricing, merchant management |
| **administrator** | Plný administrátor | Full prístup, config úpravy, feature flags, admin management |

### 2.1 Oprávnenia detail

| Akcia | support | moderator | economy_manager | administrator |
|---|---|---|---|---|
| Zobraziť profil hráča | ✅ | ✅ | ✅ | ✅ |
| Zobraziť inventár | ✅ | ✅ | ✅ | ✅ |
| Zobraziť battle reports | ✅ | ✅ | ✅ | ✅ |
| Zobraziť ledger | ✅ | ✅ | ✅ | ✅ |
| Ban hráča | ❌ | ✅ | ❌ | ✅ |
| Mute hráča | ❌ | ✅ | ❌ | ✅ |
| Upraviť gold | ❌ | ❌ | ✅ | ✅ |
| Upraviť crystals | ❌ | ❌ | ✅ | ✅ |
| Pridať item | ❌ | ❌ | ✅ | ✅ |
| Odobrať item | ❌ | ❌ | ✅ | ✅ |
| Upraviť merchant | ❌ | ❌ | ✅ | ✅ |
| Upraviť pricing | ❌ | ❌ | ✅ | ✅ |
| Upraviť config | ❌ | ❌ | ❌ | ✅ |
| Spravovať feature flags | ❌ | ❌ | ❌ | ✅ |
| Spravovať adminov | ❌ | ❌ | ❌ | ✅ |
| Zobraziť security events | ✅ | ✅ | ✅ | ✅ |
| Compensácia hráčovi | ❌ | ❌ | ✅ | ✅ |

---

## 3. Player Management

### 3.1 Vyhľadávanie hráčov

- Podľa mena (display_name)
- Podľa emailu
- Podľa ID
- Podľa frakcie
- Podľa levelu
- Podľa PvP ratingu
- Podľa dátumu registrácie

### 3.2 Profil hráča

Admin vidí:
- Základné info (meno, email, frakcia, level)
- Všetky atribúty
- Gold a crystal balance
- Energy status
- PvP štatistiky
- Úkryt (budovy a levely)
- Denné questy (status)
- Posledných 10 battle reports

### 3.3 Akcie na hráčoch

| Akcia | Popis | Audit |
|---|---|---|
| **Ban** | Zablokovanie účtu | Áno — dôvod + trvanie |
| **Unban** | Odblokovanie účtu | Áno |
| **Mute** | Obmedzenie chatu (post-MVP) | Áno — dôvod + trvanie |
| **Reset character** | Vrátenie postavy na level 1 | Áno — s kompenzáciou |
| **Compensation** | Odoslanie gold/crystals/items | Áno — dôvod + hodnota |
| **Add gold** | Pridanie gold | Áno — amount + dôvod |
| **Remove gold** | Odobratie gold | Áno — amount + dôvod |
| **Add crystals** | Pridanie kryštálov | Áno — amount + dôvod |
| **Remove crystals** | Odobratie kryštálov | Áno — amount + dôvod |

---

## 4. Economic Ledger Review

### 4.1 Prehľad

- Celkový gold v obehu
- Celkový crystals v obehu
- Denný gold flow (príjem vs. výdavok)
- Top 100 gold držiteli
- Top 100 crystal držiteli
- Inflačný trend (mesačný)

### 4.2 Detailný ledger

- Filter: character_id, currency, source, date range
- Export: CSV
- Alert pri anomáliách:
  - Gold prírastok > 10,000 / hodinu
  - Crystal prírastok > 1,000 / hodinu
  - Nečakané admin transakcie

### 4.3 Ekonomická konfigurácia

Admin môže upraviť:

| Parameter | Default | Min | Max | Popis |
|---|---|---|---|---|
| training_base_cost | 50 | 10 | 500 | Základná cena tréningu |
| energy_regen_seconds | 360 | 60 | 720 | Sekundy na regeneráciu |
| pvp_daily_limit | 20 | 5 | 100 | Denný PvP limit |
| xp_multiplier | 1.0 | 0.1 | 10.0 | Násobiteľ XP |
| gold_multiplier | 1.0 | 0.1 | 10.0 | Násobiteľ Gold |

---

## 5. Inventory Management

### 5.1 Prehľad

- Zobraziť inventár ľubovoľného hráča
- Detail každého itemu (template, quantity, durability, equipped)
- Celkový počet itemov v hre

### 5.2 Akcie

| Akcia | Popis |
|---|---|
| **Add item** | Pridať item do inventára |
| **Remove item** | Odobrať item z inventára |
| **Modify quantity** | Zmeniť množstvo stacku |
| **View item history** | Zobraziť kedy bol item získaný |

---

## 6. Activity Management

### 6.1 Prehľad

- Aktívne aktivity všetkých hráčov
- Časovo obmedzené aktivity (training, treasure hunt)
- Čakajúce na claim

### 6.2 Akcie

| Akcia | Popis |
|---|---|
| **Cancel activity** | Zrušiť aktivitu hráča |
| **Complete activity** | Vynútiť dokončenie aktivity |
| **Extend timer** | Predĺžiť čas aktivity |

---

## 7. Battle Reports

### 7.1 Prehľad

- Posledných 1000 battle reports
- Filter: battle_type, result, character, date range
- Detail: všetkých 10 kôl s damage, hit/miss, critical

### 7.2 Analýza

- Priemerný boj length (kôl)
- Win rate podľa levelu
- Priemerný damage per round
- Najčastejšie použité akcie
- Detekcia podivných patternov (botting)

---

## 8. Account Blocking

### 8.1 Ban types

| Typ | Trvanie | Použitie |
|---|---|---|
| **Temporary ban** | 1h – 30 dní | Prvé porušenia |
| **Permanent ban** | Neobmedzene | Závažné porušenia |
| **IP ban** | Podľa trvania | Botting, multi-accounting |
| **Device ban** | Podľa trvania | Ťažšíche porušenia |

### 8.2 Ban dôvody

| Kód | Dôvod |
|---|---|
| `cheating` | Používanie cheatov |
| `botting` | Automatické hranie |
| `exploit` | Zneužitie herných mechaník |
| `harassment` | Obťažovanie iných hráčov |
| `spam` | Nevyžiadaná komunikácia |
| `real-money-trading` | Predaj herných vecí za reálne peniaze |
| `multi-accounting` | Viacero účtov |
| `other` | Iné (s popisom) |

---

## 9. Config Management

### 9.1 Game config

- Economy config (ceny, multipliery)
- Combat config (damage formulas, XP curves)
- Item config (drop rates, stat ranges)
- Feature flags (zapnutie/vypnutie funkcii)

### 9.2 Config versioning

- Každá zmena je verziovaná
- Kto zmenil (admin ID)
- Kedy (timestamp)
- Čo presne (diff)
- Dôvod zmeny

---

## 10. Item Management

### 10.1 Item templates

- Zobraziť všetky item templates
- Filter: type, rarity, level_req, region
- Detail: stat bonus, damage, defense, prices

### 10.2 Akcie

| Akcia | Popis |
|---|---|
| **Edit template** | Upraviť štatistiky itemu |
| **Disable template** | Deaktivovať item (nezobrazuje sa v loot) |
| **Enable template** | Aktivovať item |
| **Create new template** | Vytvoriť nový item template |

---

## 11. Quest Management

### 11.1 Mission templates

- Zobraziť všetky mission templates
- Editovať rewards, targets, levels
- Vytvárať nové templates

### 11.2 Daily quests

- Zobraziť generované denné questy
- Force regenerácia pre konkrétneho hráča
- Editovať quest rewards

---

## 12. Merchant Management

### 12.1 Rotácia

- Zobraziť aktuálnu rotáciu
- Force refresh pre všetkých / jedného hráča
- Editovať merchant pool (item templates)
- Nastaviť premium slot items

### 12.2 Pricing

- Upraviť ceny item templates
- Nastaviť zľavy / akcie
- Bulk update cien

---

## 13. Feature Flags

### 13.1 Správa

- Zobraziť všetky feature flags
- Zapnúť / vypnúť flag
- Nastaviť rollout percentage
- Pridať / odstrániť allowed users

### 13.2 Typy flagov

| Typ | Popis |
|---|---|
| **Boolean** | Zapnuté / vypnuté |
| **Percentage** | % hráčov, ktorí vidia feature |
| **User list** | Len konkrétni hráči |

---

## 14. Security Events

### 14.1 Prehľad

- Posledných 1000 security events
- Filter: event_type, severity, user, IP, date range
- Detail: full request info, user agent, IP

### 14.2 Akcie

| Akcia | Popis |
|---|---|
| **Block IP** | Zablokovanie IP adresy |
| **Flag user** | Označiť usera ako podozrivého |
| **View related events** | Zobraziť všetky eventy z rovnakej IP |

---

## 15. Payments

### 15.1 Prehľad

- Všetky Stripe platby
- Filter: status, user, amount, date range
- Detail: Stripe session, webhook events

### 15.2 Akcie

| Akcia | Popis |
|---|---|
| **View payment detail** | Detailný pohľad na platbu |
| **Refund** | Vrátenie platby cez Stripe |
| **Grant crystals** | Ručné pridanie kryštálov (s dôvodom) |

---

## 16. Compensation

### 16.1 Typy kompenzácií

| Typ | Použitie |
|---|---|
| **Gold** | Pri bugoch, výpadkoch |
| **Crystals** | Pri bugoch, výpadkoch |
| **Items** | Pri stratených items |
| **Energy** | Pri server issues |
| **Membership days** | Pri prolonged outages |

### 16.2 Postup

1. Admin identifikuje problém
2. Vyberie typ a hodnotu kompenzácie
3. Zadá dôvod (required)
4. Systém odošle kompenzáciu
5. Hráč dostane notifikáciu
6. Transakcia je logovaná v ledger

---

## 17. Admin Dashboard Layout

```
/admin
├── /dashboard          # Prehľad (hráči online, revenue, alerts)
├── /players            # Player management
│   └── /[id]           # Detail hráča
├── /economy            # Economic ledger + config
├── /items              # Item templates
├── /quests             # Mission templates
├── /merchants          # Merchant management
├── /payments           # Stripe payments
├── /battle-reports     # Battle reports
├── /security           # Security events
├── /config             # Game config
├── /feature-flags      # Feature flags
├── /admin-users        # Admin user management
└── /audit-log          # Admin audit log
```

---

## 18. Admin Notifikácie

| Typ | Severity | Trigger |
|---|---|---|
| Gold anomaly | critical | Gold prírastok > 10,000 / hodinu |
| Crystal anomaly | critical | Crystal prírastok > 1,000 / hodinu |
| New payment | info | Nová Stripe platba |
| Refund request | warning | Hráč požiadal o refund |
| Feature flag change | info | Zmena feature flagu |
| Admin action | info | Akákoľvek admin akcia |
| Security event | warning/critical | Security alert |
