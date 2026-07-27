# Testovanie — Nocturna

## 1. Prehľad

Nocturna používa **trojúrovňový testovací prístup**: unit testy (Vitest), integration testy (Vitest + test DB), E2E testy (Playwright).

---

## 2. Unit testy (Vitest)

### 2.1 Energia regenerácia

```typescript
describe('energyRegen', () => {
  it('regeneruje 1 energiu za 6 minút');
  it('neprekračuje max_energy');
  it('počíta elapsed time správne');
  it('pracuje s membership bonusom (+25 max)');
  it('nerestoruje zápornú energiu');
  it('spracuje dlhé absencie (> 10 hodín)');
});
```

### 2.2 Training cost

```typescript
describe('trainingCost', () => {
  it('vypočíta cost = baseCost × level^1.65');
  it('baseCost = 50 pre level 1');
  it('cost rastie exponenciálne');
  it('max level 50 má cost ~3863');
  it('neprepustí level 0');
  it('neprepustí level > 50');
});
```

### 2.3 XP výpočet

```typescript
describe('xpCalculation', () => {
  it('xpForLevel = 100 × level^1.5');
  it('level 1 potrebuje 100 XP');
  it('level 10 potrebuje 3162 XP');
  it('level 50 potrebuje 35,355 XP');
  it('správne level upuje');
  it('neprekračuje max level');
});
```

### 2.4 Level up

```typescript
describe('levelUp', () => {
  it('zvýši level o 1');
  it('pridá +5 HP per level');
  it('pridá +1 všetky atribúty per level');
  it('spracuje viacero levelov naraz');
  it('neprekračuje max level 50');
});
```

### 2.5 Damage výpočet

```typescript
describe('damageCalculation', () => {
  it('damage = max(1, AP × random(0.9,1.1) - DP × 0.55)');
  it('damage je minimálne 1');
  it('critical hit násobí 1.5x');
  it('block násobí 0.5x');
  it('crit + block = 0.75x');
  it('miss = 0 damage');
  it('dodge = 0 damage');
});
```

### 2.6 Hit chance

```typescript
describe('hitChance', () => {
  it('accuracy = 70 + (PER - targetDEX) × 0.35');
  it('accuracy je clampnutý na 35–95 %');
  it('rovnaké stats = 70 % accuracy');
  it('vyšší perception = vyššia accuracy');
});
```

### 2.7 Critical hits

```typescript
describe('criticalHits', () => {
  it('criticalChance = 5 + luck × 0.15');
  it('criticalChance je clampnutý na 5–30 %');
  it('luck 5 = 5.75 %');
  it('luck 50 = 12.5 %');
});
```

### 2.8 Reward výpočet

```typescript
describe('rewardCalculation', () => {
  it('XP závisí od regiónu a levelu');
  it('Gold závisí od regiónu a levelu');
  it('Loot závisí od rarity weights');
  it('Frakčný bonus aplikuje správne');
  it('XP multiplier funguje');
  it('Gold multiplier funguje');
});
```

### 2.9 Denné questy

```typescript
describe('dailyQuests', () => {
  it('generuje 3–5 questov');
  it('questy sú pre správny level');
  it('denný reset funguje');
  it('streak sa neresetuje pri completion');
  it('streak sa resetuje pri miss');
  it('bonus za kompletné plnenie');
});
```

### 2.10 Časovo obmedzené aktivity

```typescript
describe('timedActivities', () => {
  it('aktivita sa nedá dokončiť skôr');
  it('aktivita sa nedá spustiť s nedostatkom energie');
  it('cooldown funguje');
  it('overlap nie je možný');
});
```

### 2.11 Idempotent claims

```typescript
describe('idempotentClaims', () => {
  it('double claim vráti chybu');
  it('claim je idempotentný');
  it('concurrent claims sú safe');
});
```

### 2.12 Economic ledger

```typescript
describe('economicLedger', () => {
  it('každá transakcia je logovaná');
  it('balance_after = balance_before + amount');
  it('negative balance je nemožný');
  it('ledger je konzistentný');
});
```

### 2.13 Payment webhooks

```typescript
describe('paymentWebhooks', () => {
  it('webhook je idempotentný');
  it('double payment je zabránené');
  it('refund správne odoberá crystals');
  it('membership activation funguje');
});
```

---

## 3. Integration testy

### 3.1 Registrácia

```typescript
describe('registration', () => {
  it('vytvorí účet s emailom a heslom');
  it('odošle verifikačný email');
  it('zablokuje duplicitný email');
  it('rate limituje registrácie');
  it('vyžaduje Turnstile token');
});
```

### 3.2 Character creation

```typescript
describe('characterCreation', () => {
  it('vytvorí postavu s frakciou');
  it('priradí štartové atribúty podľa frakcie');
  it('zablokuje duplicitné meno');
  it('neprepustí meno < 3 alebo > 20 znakov');
  it('priradí inventár s default slotami');
  it('priradí default equipment');
});
```

### 3.3 Expedition start/complete

```typescript
describe('expedition', () => {
  it('spustí výpravu s dostatočnou energiou');
  it('zablokuje výpravu bez energie');
  it('vygeneruje encounter');
  it('spustí bojový engine');
  it('pridelí odmeny po víťazstve');
  it('uloží battle report');
  it('zaznamená energy spend');
  it('funguje frakčný bonus');
});
```

### 3.4 Item purchase/equip

```typescript
describe('itemPurchase', () => {
  it('kúpi item za gold');
  it('zablokuje nákup bez goldu');
  it('pridá item do inventára');
  it('equip item do správneho slotu');
  it('unequip item zo slotu');
  it('zablokuje equip bez požadovaného levelu');
  it('predá item za sell_price');
});
```

### 3.5 Attribute training

```typescript
describe('attributeTraining', () => {
  it('natrénuje atribút za gold');
  it('zvýši atribút o 1');
  it('zablokuje training bez goldu');
  it('zablokuje training bez energie');
  it('zablokuje training na max leveli');
  it('vypočíta správny cost');
});
```

### 3.6 PvP

```typescript
describe('pvp', () => {
  it('spustí PvP súboj');
  it('spotrebuje 15 energie');
  it('zablokuje PvP bez energie');
  it('zablokuje PvP nad denný limit');
  it('aktualizuje ELO rating');
  it('pridelí odmeny');
  it('uloží battle report pre obidvoch');
});
```

### 3.7 Daily rewards

```typescript
describe('dailyRewards', () => {
  it('pridelí dennú odmenu');
  it('zablokuje double claim');
  it('správne počíta streak');
  'resetuje streak po miss');
  it('pridelí bonus za kompletné plnenie');
});
```

### 3.8 Crystal purchase

```typescript
describe('crystalPurchase', () => {
  it('spracuje Stripe checkout');
  it('pridelí crystals po platbe');
  it('zablokuje double payment');
  it('spracuje webhook');
  it('aktivuje membership');
});
```

---

## 4. E2E testy (Playwright)

### 4.1 Testovací scenár: New player onboarding

```
1. Navigate to /register
2. Fill in email, password
3. Complete Turnstile
4. Submit registration
5. Verify email (simulované)
6. Login
7. Navigate to character creation
8. Choose faction (Sangvari / Lunari)
9. Enter character name
10. Create character
11. Verify character is created
12. Verify starting stats
13. Verify starting equipment
```

### 4.2 Testovací scenár: First expedition

```
1. Login as new character
2. Navigate to /expedition
3. Select "Mesto bez svitania"
4. Start expedition
5. Verify energy was consumed
6. Verify battle report is shown
7. Verify XP and gold were gained
8. Verify items in inventory (if dropped)
9. Navigate to /character
10. Verify stats updated
```

### 4.3 Testovací scenár: Buy + equip item

```
1. Login as character with gold
2. Navigate to /shop
3. Find item with gold price
4. Click "Kúpiť"
5. Verify gold was deducted
6. Verify item in inventory
7. Navigate to /character/inventory
8. Click on item
9. Click "Equip"
10. Verify equipment slot updated
11. Verify stat bonus applied
```

### 4.4 Testovací scenár: PvP

```
1. Login as character level 5+
2. Navigate to /arena
3. Verify PvP button is enabled
4. Click "Hľadať súpera"
5. Verify opponent is found
6. Verify battle is processed
7. Verify ELO rating updated
8. Verify battle report available
9. Verify energy consumed
```

### 4.5 Testovací scenár: Upgrade hideout

```
1. Login as character with gold
2. Navigate to /hideout
3. Select building
4. Click "Upgrade"
5. Verify gold was deducted
6. Verify upgrade started (timer shown)
7. Wait for upgrade (time-lapse in test)
8. Verify building level increased
9. Verify bonus applied
```

### 4.6 Testovací scenár: Admin finds player

```
1. Login as admin
2. Navigate to /admin/players
3. Search for player by name
4. Click on player
5. Verify player details shown
6. Verify gold, crystals, level
7. Verify inventory
8. Verify battle history
```

### 4.7 Testovací scenár: Duplicate claim prevention

```
1. Login as character
2. Complete daily quest
3. Click "Claim reward"
4. Verify reward received
5. Try to click "Claim reward" again
6. Verify button is disabled / error shown
7. Verify gold only increased once
```

---

## 5. Viewport testovanie

### 5.1 Desktop

| Viewport | Rozmery |
|---|---|
| Large desktop | 1920 × 1080 |
| Standard desktop | 1366 × 768 |
| Small desktop | 1024 × 768 |

### 5.2 Mobile

| Viewport | Rozmery |
|---|---|
| iPhone 14 | 390 × 844 |
| iPhone SE | 375 × 667 |
| Android (Pixel 7) | 412 × 915 |
| iPad | 820 × 1180 |

### 5.3 Testovacie scenáre

- Všetky E2E testy sa spúšťajú na oboch viewportoch
- Responzívne layout testy
- Touch event testy (mobile)
- Navigácia testy (mobile menu)

---

## 6. Testovacie prostredie

### 6.1 Unit + Integration

```bash
# Spustenie všetkých testov
npm run test

# Spustenie s coverage
npm run test:coverage

# Spustenie len unit testov
npm run test:unit

# Spustenie len integration testov
npm run test:integration
```

### 6.2 E2E

```bash
# Spustenie všetkých E2E testov
npm run test:e2e

# Spustenie v UI mode (debugovanie)
npm run test:e2e:ui

# Spustenie len na desktop
npm run test:e2e:desktop

# Spustenie len na mobile
npm run test:e2e:mobile
```

### 6.3 Testovacia databáza

- Supabase test instance
- Migrated schema
- Seed data
- Auto-cleanup po testoch

---

## 7. CI/CD integrácia

### 7.1 GitHub Actions workflow

```yaml
on: [push, pull_request]
jobs:
  test:
    steps:
      - Checkout
      - Install dependencies
      - Run unit tests
      - Run integration tests
      - Run E2E tests
      - Upload coverage
```

### 7.2 Coverage thresholds

| Metrika | Min coverage |
|---|---|
| Statements | 80 % |
| Branches | 75 % |
| Functions | 80 % |
| Lines | 80 % |

---

## 8. Test data

### 8.1 Fixtures

```typescript
// Testovacie postavy
const testCharacter = {
  name: 'TestHero',
  faction: 'sangvari',
  level: 15,
  strength: 12,
  dexterity: 10,
  endurance: 11,
  perception: 8,
  willpower: 8,
  luck: 7,
  gold: 5000,
  crystals: 50,
  energy: 80,
};

// Testovacie items
const testWeapon = {
  templateId: 'iron_sword',
  type: 'weapon',
  rarity: 'common',
  damage: 10,
  levelReq: 1,
};
```

### 8.2 Seed data

- 10 testovacích postáv (rôzne levely a frakcie)
- 50 testovacích items (rôzne rarity)
- 5 testovacích battle reports
- Testovací merchant pool
- Testovacie daily quests
