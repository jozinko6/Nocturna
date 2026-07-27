# Databázová schéma — Nocturna

## 1. Prehľad

Nocturna používa **PostgreSQL** (Supabase) s **Drizzle ORM**. Všetky tabuľky sú definované v `db/schema.ts`.

---

## 2. Schéma

### 2.1 users

Používatelia — integrované s Supabase Auth.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_banned     BOOLEAN DEFAULT FALSE,
  ban_reason    TEXT,
  role          VARCHAR(20) DEFAULT 'player'
                CHECK (role IN ('player', 'admin')),
  registration_ip INET,
  registration_country VARCHAR(2)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_banned ON users(is_banned);
```

---

### 2.2 profiles

Profily hráčov (verejné informácie).

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name  VARCHAR(30) NOT NULL UNIQUE,
  avatar_url    VARCHAR(500),
  bio           VARCHAR(200) DEFAULT '',
  faction       VARCHAR(10) NOT NULL CHECK (faction IN ('sangvari', 'lunari')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_faction ON profiles(faction);
CREATE INDEX idx_profiles_display_name ON profiles(display_name);
```

---

### 2.3 characters

Postavy hráčov.

```sql
CREATE TABLE characters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(20) NOT NULL UNIQUE,
  level         INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  xp            BIGINT DEFAULT 0 CHECK (xp >= 0),
  gold          BIGINT DEFAULT 100 CHECK (gold >= 0),
  crystals      INTEGER DEFAULT 0 CHECK (crystals >= 0),
  energy        INTEGER DEFAULT 100 CHECK (energy >= 0 AND energy <= 150),
  max_energy    INTEGER DEFAULT 100 CHECK (max_energy >= 100 AND max_energy <= 150),
  energy_last_update TIMESTAMPTZ DEFAULT NOW(),
  pvp_rating    INTEGER DEFAULT 1000 CHECK (pvp_rating >= 0),
  pvp_wins      INTEGER DEFAULT 0 CHECK (pvp_wins >= 0),
  pvp_losses    INTEGER DEFAULT 0 CHECK (pvp_losses >= 0),
  pvp_streak    INTEGER DEFAULT 0,
  pvp_daily_fights INTEGER DEFAULT 0,
  pvp_daily_reset TIMESTAMPTZ DEFAULT NOW(),
  current_region VARCHAR(50) DEFAULT 'mesto-bez-svitania',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_level ON characters(level);
CREATE INDEX idx_characters_pvp_rating ON characters(pvp_rating DESC);
CREATE INDEX idx_characters_name ON characters(name);
```

---

### 2.4 factions

Frakčné informácie (statické, pre referenciu).

```sql
CREATE TABLE factions (
  id            VARCHAR(10) PRIMARY KEY, -- 'sangvari', 'lunari'
  name          VARCHAR(50) NOT NULL,
  description   TEXT NOT NULL,
  bonus_stat1   VARCHAR(20), -- 'strength', 'perception'
  bonus_stat2   VARCHAR(20), -- 'endurance', 'willpower'
  bonus_value1  INTEGER DEFAULT 2,
  bonus_value2  INTEGER DEFAULT 1,
  region_bonus  VARCHAR(50), -- 'cerny-les', 'mesacne-vrchy'
  region_bonus_value NUMERIC(3,2) DEFAULT 0.10, -- 10%
  lore_text     TEXT
);

INSERT INTO factions VALUES
  ('sangvari', 'Sangvari', 'Krvavý kmeň bojovníkov', 'strength', 'endurance', 2, 1, 'cerny-les', 0.10, '...'),
  ('lunari', 'Lunari', 'Mesáčni strážcovia', 'perception', 'willpower', 2, 1, 'mesacne-vrchy', 0.10, '...');
```

---

### 2.5 character_stats

Primárne atribúty postáv.

```sql
CREATE TABLE character_stats (
  character_id  UUID PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  strength      INTEGER DEFAULT 6 CHECK (strength >= 1 AND strength <= 50),
  dexterity     INTEGER DEFAULT 6 CHECK (dexterity >= 1 AND dexterity <= 50),
  endurance     INTEGER DEFAULT 6 CHECK (endurance >= 1 AND endurance <= 50),
  perception    INTEGER DEFAULT 6 CHECK (perception >= 1 AND perception <= 50),
  willpower     INTEGER DEFAULT 6 CHECK (willpower >= 1 AND willpower <= 50),
  luck          INTEGER DEFAULT 5 CHECK (luck >= 1 AND luck <= 50),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_character_stats_character_id ON character_stats(character_id);
```

---

### 2.6 character_resources

Ďalšie zdroje postáv (energia tracking, denné odmeny, streak).

```sql
CREATE TABLE character_resources (
  character_id    UUID PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  energy          INTEGER DEFAULT 100 CHECK (energy >= 0 AND energy <= 150),
  max_energy      INTEGER DEFAULT 100 CHECK (max_energy >= 100 AND max_energy <= 150),
  energy_last_update TIMESTAMPTZ DEFAULT NOW(),
  daily_streak    INTEGER DEFAULT 0 CHECK (daily_streak >= 0),
  last_daily_claim TIMESTAMPTZ,
  last_daily_quest_reset TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_character_resources_character_id ON character_resources(character_id);
```

---

### 2.7 energy_snapshots

Historické záznamy energie (pre audit a debugovanie).

```sql
CREATE TABLE energy_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  energy_before INTEGER NOT NULL,
  energy_after  INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  reason        VARCHAR(50) NOT NULL, -- 'expedition', 'training', 'pvp', 'regen', 'daily_reward', 'purchase'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_energy_snapshots_character_id ON energy_snapshots(character_id);
CREATE INDEX idx_energy_snapshots_created_at ON energy_snapshots(created_at);
```

---

### 2.8 item_templates

Šablóny predmetov (definície, nie inštancie).

```sql
CREATE TABLE item_templates (
  id            VARCHAR(50) PRIMARY KEY, -- 'iron_sword', 'leather_armor', etc.
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('weapon', 'armor', 'accessory', 'consumable')),
  slot          VARCHAR(20) CHECK (slot IN ('weapon', 'armor', 'accessory', 'consumable')),
  rarity        VARCHAR(10) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  level_req     INTEGER DEFAULT 1 CHECK (level_req >= 1),
  stat_bonus    JSONB DEFAULT '{}', -- {"strength": 5, "defense": 10}
  damage        INTEGER DEFAULT 0, -- for weapons
  defense       INTEGER DEFAULT 0, -- for armor
  special_effect TEXT, -- "Heals 10 HP after each round"
  buy_price_gold INTEGER, -- price in gold (null = not buyable)
  buy_price_crystals INTEGER, -- price in crystals (null = not buyable)
  sell_price_gold INTEGER DEFAULT 0, -- sell price in gold
  stackable     BOOLEAN DEFAULT FALSE,
  max_stack     INTEGER DEFAULT 1,
  region        VARCHAR(50), -- null = all regions, or specific region
  drop_weight   INTEGER DEFAULT 100, -- relative weight in loot tables
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_item_templates_type ON item_templates(type);
CREATE INDEX idx_item_templates_rarity ON item_templates(rarity);
CREATE INDEX idx_item_templates_level_req ON item_templates(level_req);
CREATE INDEX idx_item_templates_region ON item_templates(region);
CREATE INDEX idx_item_templates_is_active ON item_templates(is_active);
```

---

### 2.9 inventories

Inventár postavy.

```sql
CREATE TABLE inventories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  max_slots     INTEGER DEFAULT 30 CHECK (max_slots >= 10 AND max_slots <= 200),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventories_character_id ON inventories(character_id);
```

---

### 2.10 character_items

Predmety v inventári (inštancie itemov).

```sql
CREATE TABLE character_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  inventory_id  UUID NOT NULL REFERENCES inventories(id) ON DELETE CASCADE,
  template_id   VARCHAR(50) NOT NULL REFERENCES item_templates(id),
  quantity      INTEGER DEFAULT 1 CHECK (quantity >= 1),
  is_equipped   BOOLEAN DEFAULT FALSE,
  equipped_slot VARCHAR(20) CHECK (equipped_slot IN ('weapon', 'armor', 'accessory')),
  durability    INTEGER DEFAULT 100 CHECK (durability >= 0 AND durability <= 100),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, equipped_slot) -- only one item per slot
);

CREATE INDEX idx_character_items_character_id ON character_items(character_id);
CREATE INDEX idx_character_items_template_id ON character_items(template_id);
CREATE INDEX idx_character_items_is_equipped ON character_items(is_equipped);
```

---

### 2.11 equipment_slots

Aktívne vybavenie postavy (derived z character_items).

```sql
CREATE TABLE equipment_slots (
  character_id  UUID PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  weapon_id     UUID REFERENCES character_items(id) ON DELETE SET NULL,
  armor_id      UUID REFERENCES character_items(id) ON DELETE SET NULL,
  accessory_id  UUID REFERENCES character_items(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_slots_character_id ON equipment_slots(character_id);
```

---

### 2.12 activities

Časovo obmedzené aktivity.

```sql
CREATE TABLE activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'training', 'treasure_hunt', 'ritual'
  status        VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  completes_at  TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ,
  result        JSONB, -- activity-specific results
  energy_cost   INTEGER NOT NULL CHECK (energy_cost > 0),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_character_id ON activities(character_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_completes_at ON activities(completes_at);
CREATE INDEX idx_activities_character_id_status ON activities(character_id, status);
```

---

### 2.13 activity_rewards

Odmenny za aktivity.

```sql
CREATE TABLE activity_rewards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id   UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  reward_type   VARCHAR(30) NOT NULL, -- 'gold', 'crystals', 'xp', 'item'
  reward_value  INTEGER NOT NULL CHECK (reward_value > 0),
  item_template_id VARCHAR(50) REFERENCES item_templates(id),
  claimed       BOOLEAN DEFAULT FALSE,
  claimed_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_rewards_activity_id ON activity_rewards(activity_id);
CREATE INDEX idx_activity_rewards_character_id ON activity_rewards(character_id);
```

---

### 2.14 missions

Misie (denné úlohy v MVP).

```sql
CREATE TABLE missions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  template_id   VARCHAR(50) NOT NULL, -- reference to mission_templates
  status        VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'expired')),
  progress      INTEGER DEFAULT 0 CHECK (progress >= 0),
  target        INTEGER NOT NULL CHECK (target > 0),
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_missions_character_id ON missions(character_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_expires_at ON missions(expires_at);
CREATE INDEX idx_missions_character_id_status ON missions(character_id, status);
```

---

### 2.15 mission_templates

Šablóny misií.

```sql
CREATE TABLE mission_templates (
  id            VARCHAR(50) PRIMARY KEY, -- 'kill_enemies', 'train_attributes', etc.
  name          VARCHAR(100) NOT NULL,
  description   TEXT NOT NULL,
  type          VARCHAR(30) NOT NULL, -- 'combat', 'training', 'explore', 'pvp', 'collect'
  min_level     INTEGER DEFAULT 1,
  max_level     INTEGER DEFAULT 50,
  target_min    INTEGER NOT NULL,
  target_max    INTEGER NOT NULL,
  xp_reward_min INTEGER NOT NULL,
  xp_reward_max INTEGER NOT NULL,
  gold_reward_min INTEGER NOT NULL,
  gold_reward_max INTEGER NOT NULL,
  crystal_reward INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE
);
```

---

### 2.16 mission_progress

Sledovanie progresu misií (pre denné misie).

```sql
CREATE TABLE mission_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  mission_id    UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  event_type    VARCHAR(30) NOT NULL, -- 'enemy_killed', 'expedition_completed', etc.
  event_data    JSONB, -- {"region": "cerny-les", "enemy_type": "wolf"}
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mission_progress_character_id ON mission_progress(character_id);
CREATE INDEX idx_mission_progress_mission_id ON mission_progress(mission_id);
```

---

### 2.17 encounters

Encountery (generované pre výpravy).

```sql
CREATE TABLE encounters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  region        VARCHAR(50) NOT NULL,
  enemy_name    VARCHAR(100) NOT NULL,
  enemy_level   INTEGER NOT NULL,
  enemy_hp      INTEGER NOT NULL,
  enemy_attack  INTEGER NOT NULL,
  enemy_defense INTEGER NOT NULL,
  enemy_special TEXT, -- special ability description
  terrain       VARCHAR(30), -- 'forest', 'crypt', 'mountain', 'ruins'
  loot_table    JSONB, -- predefined loot for this encounter
  status        VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'victory', 'defeat', 'fled')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ
);

CREATE INDEX idx_encounters_character_id ON encounters(character_id);
CREATE INDEX idx_encounters_status ON encounters(status);
CREATE INDEX idx_encounters_region ON encounters(region);
```

---

### 2.18 battle_reports

Správy o bitkách.

```sql
CREATE TABLE battle_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  battle_type   VARCHAR(20) NOT NULL CHECK (battle_type IN ('pve', 'pvp')),
  encounter_id  UUID REFERENCES encounters(id),
  pvp_opponent_id UUID REFERENCES characters(id),
  result        VARCHAR(10) NOT NULL CHECK (result IN ('victory', 'defeat', 'draw')),
  rounds_played INTEGER NOT NULL CHECK (rounds_played >= 1 AND rounds_played <= 10),
  xp_gained     INTEGER DEFAULT 0,
  gold_gained   INTEGER DEFAULT 0,
  items_gained  JSONB DEFAULT '[]',
  energy_cost   INTEGER NOT NULL,
  seed          VARCHAR(50) NOT NULL, -- RNG seed for reproducibility
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_battle_reports_character_id ON battle_reports(character_id);
CREATE INDEX idx_battle_reports_battle_type ON battle_reports(battle_type);
CREATE INDEX idx_battle_reports_created_at ON battle_reports(created_at);
```

---

### 2.19 battle_rounds

Jednotlivé kolá v bitkách.

```sql
CREATE TABLE battle_rounds (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id     UUID NOT NULL REFERENCES battle_reports(id) ON DELETE CASCADE,
  round_number  INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 10),
  attacker_action VARCHAR(20) NOT NULL, -- 'attack', 'defend', 'special'
  defender_action VARCHAR(20) NOT NULL, -- 'attack', 'defend', 'dodge'
  attacker_hp   INTEGER NOT NULL,
  defender_hp   INTEGER NOT NULL,
  damage_dealt  INTEGER DEFAULT 0,
  is_critical   BOOLEAN DEFAULT FALSE,
  is_dodge      BOOLEAN DEFAULT FALSE,
  is_block      BOOLEAN DEFAULT FALSE,
  hit           BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_battle_rounds_battle_id ON battle_rounds(battle_id);
```

---

### 2.20 pvp_ratings

PvP rating histórie.

```sql
CREATE TABLE pvp_ratings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  old_rating    INTEGER NOT NULL,
  new_rating    INTEGER NOT NULL,
  rating_change INTEGER GENERATED ALWAYS AS (new_rating - old_rating) STORED,
  opponent_id   UUID REFERENCES characters(id),
  result        VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pvp_ratings_character_id ON pvp_ratings(character_id);
CREATE INDEX idx_pvp_ratings_created_at ON pvp_ratings(created_at);
```

---

### 2.21 leaderboards

Rebríčky (generované periodicky).

```sql
CREATE TABLE leaderboards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type VARCHAR(30) NOT NULL, -- 'pvp_rating', 'pvp_wins', 'level', 'faction_power'
  period        VARCHAR(20) NOT NULL, -- 'weekly', 'alltime'
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  rank          INTEGER NOT NULL,
  score         INTEGER NOT NULL,
  faction       VARCHAR(10) NOT NULL,
  level         INTEGER NOT NULL,
  week_start    DATE, -- for weekly leaderboards
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboards_type_period ON leaderboards(leaderboard_type, period);
CREATE INDEX idx_leaderboards_rank ON leaderboards(leaderboard_type, period, rank);
CREATE INDEX idx_leaderboards_character_id ON leaderboards(character_id);
```

---

### 2.22 hideouts

Úkryty postáv.

```sql
CREATE TABLE hideouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  main_level    INTEGER DEFAULT 1 CHECK (main_level >= 1 AND main_level <= 5),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id)
);

CREATE INDEX idx_hideouts_character_id ON hideouts(character_id);
```

---

### 2.23 hideout_buildings

Budovy v úkryte.

```sql
CREATE TABLE hideout_buildings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hideout_id    UUID NOT NULL REFERENCES hideouts(id) ON DELETE CASCADE,
  building_type VARCHAR(30) NOT NULL, -- 'smithy', 'infirmary', 'training_ground', 'bed', 'storage'
  level         INTEGER DEFAULT 1 CHECK (level >= 0 AND level <= 5),
  upgrade_started_at TIMESTAMPTZ,
  upgrade_completes_at TIMESTAMPTZ,
  is_upgrading  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hideout_id, building_type)
);

CREATE INDEX idx_hideout_buildings_hideout_id ON hideout_buildings(hideout_id);
CREATE INDEX idx_hideout_buildings_is_upgrading ON hideout_buildings(is_upgrading);
```

---

### 2.24 daily_quests

Denné questy (generované denne).

```sql
CREATE TABLE daily_quests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  template_id   VARCHAR(50) NOT NULL REFERENCES mission_templates(id),
  quest_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  status        VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'expired')),
  progress      INTEGER DEFAULT 0 CHECK (progress >= 0),
  target        INTEGER NOT NULL CHECK (target > 0),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, template_id, quest_date)
);

CREATE INDEX idx_daily_quests_character_id ON daily_quests(character_id);
CREATE INDEX idx_daily_quests_quest_date ON daily_quests(quest_date);
CREATE INDEX idx_daily_quests_character_id_quest_date ON daily_quests(character_id, quest_date);
```

---

### 2.25 daily_quest_progress

Sledovanie progresu denných questov.

```sql
CREATE TABLE daily_quest_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  quest_id      UUID NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE,
  event_type    VARCHAR(30) NOT NULL,
  event_data    JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_quest_progress_character_id ON daily_quest_progress(character_id);
CREATE INDEX idx_daily_quest_progress_quest_id ON daily_quest_progress(quest_id);
```

---

### 2.26 notifications

In-app notifikácie.

```sql
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  type          VARCHAR(30) NOT NULL, -- 'daily_reward', 'pvp_result', 'quest_complete', 'system'
  title         VARCHAR(100) NOT NULL,
  message       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT FALSE,
  metadata      JSONB, -- additional data
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_character_id ON notifications(character_id);
CREATE INDEX idx_notifications_is_read ON notifications(character_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

### 2.27 currencies

Meny v hre (pre audit).

```sql
CREATE TABLE currencies (
  id            VARCHAR(20) PRIMARY KEY, -- 'gold', 'crystals'
  name          VARCHAR(50) NOT NULL,
  description   TEXT,
  max_balance   BIGINT, -- null = unlimited
  is_premium    BOOLEAN DEFAULT FALSE
);

INSERT INTO currencies VALUES
  ('gold', 'Gold', 'Základná mena', 999999999, FALSE),
  ('crystals', 'Nočné kryštály', 'Premium mena', 999999, TRUE);
```

---

### 2.28 currency_ledger

Ekonomický ledger — každá transakcia je logovaná.

```sql
CREATE TABLE currency_ledger (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  currency      VARCHAR(20) NOT NULL REFERENCES currencies(id),
  amount        INTEGER NOT NULL, -- positive = príjem, negative = výdavok
  balance_after BIGINT NOT NULL, -- balance po transakcii
  source        VARCHAR(30) NOT NULL, -- 'expedition', 'training', 'shop', 'pvp', 'daily', 'admin', 'payment', 'mission', 'hideout'
  reference_id  UUID, -- odkaz na súvisiaci záznam (battle_report, activity, purchase, etc.)
  reference_type VARCHAR(30), -- 'battle_report', 'activity', 'purchase', 'admin_action', etc.
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_currency_ledger_character_id ON currency_ledger(character_id);
CREATE INDEX idx_currency_ledger_currency ON currency_ledger(currency);
CREATE INDEX idx_currency_ledger_source ON currency_ledger(source);
CREATE INDEX idx_currency_ledger_created_at ON currency_ledger(created_at);
CREATE INDEX idx_currency_ledger_character_id_currency ON currency_ledger(character_id, currency);
```

---

### 2.29 purchases

Nákupy (Stripe).

```sql
CREATE TABLE purchases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id  UUID REFERENCES characters(id),
  stripe_payment_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255),
  package_type  VARCHAR(30) NOT NULL, -- 'crystals_500', 'crystals_1100', etc.
  amount_cents  INTEGER NOT NULL,
  currency      VARCHAR(3) DEFAULT 'EUR',
  status        VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  crystals_granted INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_stripe_payment_id ON purchases(stripe_payment_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_created_at ON purchases(created_at);
```

---

### 2.30 payment_events

Stripe webhook events (pre audit).

```sql
CREATE TABLE payment_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type    VARCHAR(100) NOT NULL, -- 'checkout.session.completed', 'payment_intent.succeeded', etc.
  payload       JSONB NOT NULL,
  processed     BOOLEAN DEFAULT FALSE,
  processed_at  TIMESTAMPTZ,
  error         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_events_stripe_event_id ON payment_events(stripe_event_id);
CREATE INDEX idx_payment_events_event_type ON payment_events(event_type);
CREATE INDEX idx_payment_events_processed ON payment_events(processed);
```

---

### 2.31 subscriptions

Členstvo Nočný patrón.

```sql
CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status        VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  plan          VARCHAR(30) DEFAULT 'nocturnal_patron',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

### 2.32 rewarded_ad_claims

Odmeny za reklamy.

```sql
CREATE TABLE rewarded_ad_claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  ad_type       VARCHAR(30) NOT NULL, -- 'energy_boost', 'double_xp', 'bonus_gold'
  reward_type   VARCHAR(30) NOT NULL,
  reward_value  INTEGER NOT NULL,
  claimed_at    TIMESTAMPTZ DEFAULT NOW(),
  ip_address    INET,
  user_agent    TEXT
);

CREATE INDEX idx_rewarded_ad_claims_character_id ON rewarded_ad_claims(character_id);
CREATE INDEX idx_rewarded_ad_claims_claimed_at ON rewarded_ad_claims(claimed_at);
```

---

### 2.33 economy_config

Konfigurácia ekonomiky (pre admin úpravy).

```sql
CREATE TABLE economy_config (
  id            VARCHAR(50) PRIMARY KEY, -- 'training_base_cost', 'energy_regen_seconds', etc.
  value         NUMERIC NOT NULL,
  description   TEXT,
  min_value     NUMERIC,
  max_value     NUMERIC,
  is_active     BOOLEAN DEFAULT TRUE,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_by    UUID REFERENCES users(id)
);

INSERT INTO economy_config VALUES
  ('training_base_cost', 50, 'Základná cena tréningu', 10, 500, TRUE, NOW(), NULL),
  ('energy_regen_seconds', 360, 'Sekundy na regeneráciu 1 energie', 60, 720, TRUE, NOW(), NULL),
  ('pvp_daily_limit', 20, 'Denný limit PvP súbojov', 5, 100, TRUE, NOW(), NULL),
  ('xp_multiplier', 1.0, 'Násobiteľ XP', 0.1, 10.0, TRUE, NOW(), NULL),
  ('gold_multiplier', 1.0, 'Násobiteľ Gold', 0.1, 10.0, TRUE, NOW(), NULL);
```

---

### 2.34 game_config_versions

Verzie konfigurácie (pre audit).

```sql
CREATE TABLE game_config_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type   VARCHAR(50) NOT NULL, -- 'economy', 'combat', 'items', etc.
  version       INTEGER NOT NULL,
  config_data   JSONB NOT NULL,
  changed_by    UUID NOT NULL REFERENCES users(id),
  change_reason TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_config_versions_config_type ON game_config_versions(config_type);
CREATE INDEX idx_game_config_versions_version ON game_config_versions(config_type, version);
```

---

### 2.35 admin_users

Admin používatelia a ich roly.

```sql
CREATE TABLE admin_users (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role          VARCHAR(20) NOT NULL
                CHECK (role IN ('support', 'moderator', 'economy_manager', 'administrator')),
  permissions   JSONB DEFAULT '{}', -- granular permissions
  granted_by    UUID REFERENCES users(id),
  granted_at    TIMESTAMPTZ DEFAULT NOW(),
  is_active     BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);
```

---

### 2.36 admin_audit_logs

Logovanie admin akcií.

```sql
CREATE TABLE admin_audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  action        VARCHAR(50) NOT NULL, -- 'ban_player', 'modify_gold', 'reset_character', etc.
  target_user_id UUID REFERENCES users(id),
  target_character_id UUID REFERENCES characters(id),
  details       JSONB NOT NULL, -- what was changed
  ip_address    INET,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
```

---

### 2.37 security_events

Bezpečnostné udalosti.

```sql
CREATE TABLE security_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    VARCHAR(50) NOT NULL, -- 'rate_limit', 'csrf_violation', 'suspicious_activity', etc.
  user_id       UUID REFERENCES users(id),
  ip_address    INET NOT NULL,
  user_agent    TEXT,
  details       JSONB,
  severity      VARCHAR(10) DEFAULT 'info'
                CHECK (severity IN ('info', 'warning', 'critical')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_security_events_severity ON security_events(severity);
```

---

### 2.38 feature_flags

Feature flags (cez PostHog alebo vlastné).

```sql
CREATE TABLE feature_flags (
  id            VARCHAR(50) PRIMARY KEY, -- 'pvp_enabled', 'clans_enabled', etc.
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  is_enabled    BOOLEAN DEFAULT FALSE,
  rollout_pct   INTEGER DEFAULT 0 CHECK (rollout_pct >= 0 AND rollout_pct <= 100),
  allowed_users UUID[], -- specific users who always see this flag
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_is_enabled ON feature_flags(is_enabled);
```

---

## 3. Vzťahy medzi tabuľkami

```
users ──┬── profiles
        ├── characters ──┬── character_stats
        │                 ├── character_resources
        │                 ├── energy_snapshots
        │                 ├── inventories ── character_items
        │                 ├── equipment_slots
        │                 ├── encounters
        │                 ├── battle_reports ── battle_rounds
        │                 ├── pvp_ratings
        │                 ├── leaderboards
        │                 ├── hideouts ── hideout_buildings
        │                 ├── daily_quests ── daily_quest_progress
        │                 ├── missions ── mission_progress
        │                 ├── activities ── activity_rewards
        │                 ├── notifications
        │                 ├── currency_ledger
        │                 ├── purchases
        │                 └── rewarded_ad_claims
        ├── subscriptions
        ├── admin_users ── admin_audit_logs
        └── security_events

item_templates ── character_items
currencies ── currency_ledger
mission_templates ── missions, daily_quests
factions ── profiles
feature_flags (standalone)
game_config_versions (standalone)
economy_config (standalone)
```

---

## 4. Indexy — Zhrnutie

Celkom: **~80 indexov** pokrývajúcich:
- Primárne kľúče (implicitné)
- Foreign keys (pre JOIN performance)
- Často filtrované stĺpce (status, type, region)
- Časové stĺpce (created_at pre pagination)
- Kompozitné indexy (character_id + status pre filtered queries)
- Descending indexy (leaderboard rankings)
