import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  emailVerified: boolean('email_verified').notNull().default(false),
  banned: boolean('banned').notNull().default(false),
  banReason: text('ban_reason'),
  role: text('role', {
    enum: ['player', 'support', 'moderator', 'economy_manager', 'administrator'],
  })
    .notNull()
    .default('player'),
});

// ─── Profiles ───────────────────────────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  marketingConsent: boolean('marketing_consent').notNull().default(false),
  analyticsConsent: boolean('analytics_consent').notNull().default(false),
  language: text('language', { enum: ['sk', 'en'] }).notNull().default('sk'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Factions ───────────────────────────────────────────────────────────────

export const factions = pgTable('factions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  passiveBonuses: jsonb('passive_bonuses'),
  iconUrl: text('icon_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Characters ─────────────────────────────────────────────────────────────

export const characters = pgTable(
  'characters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    factionId: uuid('faction_id')
      .notNull()
      .references(() => factions.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    level: integer('level').notNull().default(1),
    experience: integer('experience').notNull().default(0),
    portraitUrl: text('portrait_url'),
    title: text('title'),
    gold: integer('gold').notNull().default(200),
    premiumCurrency: integer('premium_currency').notNull().default(0),
    pvpRating: integer('pvp_rating').notNull().default(1000),
    pvpWins: integer('pvp_wins').notNull().default(0),
    pvpLosses: integer('pvp_losses').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('characters_user_id_idx').on(t.userId),
    index('characters_faction_id_idx').on(t.factionId),
    index('characters_level_idx').on(t.level),
    index('characters_pvp_rating_idx').on(t.pvpRating),
  ],
);

// ─── Character Stats ────────────────────────────────────────────────────────

export const characterStats = pgTable('character_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id')
    .notNull()
    .references(() => characters.id, { onDelete: 'cascade' })
    .unique(),
  strength: integer('strength').notNull().default(5),
  dexterity: integer('dexterity').notNull().default(5),
  endurance: integer('endurance').notNull().default(5),
  perception: integer('perception').notNull().default(5),
  willpower: integer('willpower').notNull().default(5),
  luck: integer('luck').notNull().default(5),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Character Resources ────────────────────────────────────────────────────

export const characterResources = pgTable('character_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id')
    .notNull()
    .references(() => characters.id, { onDelete: 'cascade' })
    .unique(),
  currentEnergy: integer('current_energy').notNull().default(100),
  maxEnergy: integer('max_energy').notNull().default(100),
  lastEnergyUpdate: timestamp('last_energy_update', { withTimezone: true }),
  hitPoints: integer('hit_points').notNull().default(100),
  maxHitPoints: integer('max_hit_points').notNull().default(100),
});

// ─── Item Templates ─────────────────────────────────────────────────────────

export const itemTemplates = pgTable(
  'item_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    type: text('type', {
      enum: [
        'weapon',
        'offhand',
        'helmet',
        'armor',
        'gloves',
        'boots',
        'amulet',
        'ring',
        'relic',
        'consumable',
      ],
    }).notNull(),
    rarity: text('rarity', {
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'cursed'],
    }).notNull(),
    requiredLevel: integer('required_level').notNull().default(1),
    baseDamage: integer('base_damage').notNull().default(0),
    baseDefense: integer('base_defense').notNull().default(0),
    statBonus: jsonb('stat_bonus'),
    secondaryEffect: jsonb('secondary_effect'),
    factionRestriction: uuid('faction_restriction').references(() => factions.id, {
      onDelete: 'set null',
    }),
    buyPrice: integer('buy_price').notNull(),
    sellPrice: integer('sell_price').notNull(),
    iconUrl: text('icon_url'),
    loreText: text('lore_text'),
    isTradeable: boolean('is_tradeable').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('item_templates_type_idx').on(t.type),
    index('item_templates_rarity_idx').on(t.rarity),
    index('item_templates_required_level_idx').on(t.requiredLevel),
  ],
);

// ─── Character Items ────────────────────────────────────────────────────────

export const characterItems = pgTable(
  'character_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    templateId: uuid('template_id')
      .notNull()
      .references(() => itemTemplates.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('character_items_character_id_idx').on(t.characterId),
    index('character_items_template_id_idx').on(t.templateId),
  ],
);

// ─── Equipment Slots ────────────────────────────────────────────────────────

export const equipmentSlots = pgTable(
  'equipment_slots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    slotType: text('slot_type', {
      enum: ['weapon', 'offhand', 'helmet', 'armor', 'gloves', 'boots', 'amulet', 'ring', 'relic'],
    }).notNull(),
    itemId: uuid('item_id').references(() => characterItems.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('equipment_slots_character_id_idx').on(t.characterId),
    uniqueIndex('equipment_slots_character_slot_unique').on(t.characterId, t.slotType),
  ],
);

// ─── Activities ─────────────────────────────────────────────────────────────

export const activities = pgTable(
  'activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    activityType: text('activity_type', {
      enum: ['expedition', 'exploration', 'work', 'regeneration', 'training'],
    }).notNull(),
    status: text('status', {
      enum: ['in_progress', 'completed', 'claimed'],
    }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    claimedAt: timestamp('claimed_at', { withTimezone: true }),
    config: jsonb('config'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('activities_character_id_idx').on(t.characterId),
    index('activities_status_idx').on(t.status),
    index('activities_ends_at_idx').on(t.endsAt),
  ],
);

// ─── Activity Rewards ───────────────────────────────────────────────────────

export const activityRewards = pgTable(
  'activity_rewards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    activityId: uuid('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    goldAmount: integer('gold_amount').notNull().default(0),
    experienceAmount: integer('experience_amount').notNull().default(0),
    itemId: uuid('item_id').references(() => itemTemplates.id, {
      onDelete: 'set null',
    }),
    rewardType: text('reward_type').notNull(),
    claimed: boolean('claimed').notNull().default(false),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('activity_rewards_character_id_idx').on(t.characterId),
    index('activity_rewards_activity_id_idx').on(t.activityId),
  ],
);

// ─── Regions ────────────────────────────────────────────────────────────────

export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  recommendedLevel: integer('recommended_level').notNull(),
  iconUrl: text('icon_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Enemies ────────────────────────────────────────────────────────────────

export const enemies = pgTable(
  'enemies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    level: integer('level').notNull(),
    baseHp: integer('base_hp').notNull(),
    baseAttack: integer('base_attack').notNull(),
    baseDefense: integer('base_defense').notNull(),
    baseXp: integer('base_xp').notNull(),
    baseGold: integer('base_gold').notNull(),
    lootTable: jsonb('loot_table'),
    portraitUrl: text('portrait_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('enemies_region_id_idx').on(t.regionId),
    index('enemies_level_idx').on(t.level),
  ],
);

// ─── Expeditions ────────────────────────────────────────────────────────────

export const expeditions = pgTable(
  'expeditions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    regionId: uuid('region_id')
      .notNull()
      .references(() => regions.id, { onDelete: 'restrict' }),
    difficulty: text('difficulty', {
      enum: ['safe', 'uncertain', 'dangerous', 'lethal'],
    }).notNull(),
    status: text('status', {
      enum: ['in_progress', 'completed', 'failed'],
    }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    result: jsonb('result'),
    battleReportId: uuid('battle_report_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('expeditions_character_id_idx').on(t.characterId),
    index('expeditions_region_id_idx').on(t.regionId),
    index('expeditions_status_idx').on(t.status),
  ],
);

// ─── Battle Reports ─────────────────────────────────────────────────────────

export const battleReports = pgTable(
  'battle_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attackerId: uuid('attacker_id').references(() => characters.id, {
      onDelete: 'set null',
    }),
    defenderId: uuid('defender_id').references(() => characters.id, {
      onDelete: 'set null',
    }),
    battleType: text('battle_type', { enum: ['pve', 'pvp'] }).notNull(),
    seed: integer('seed').notNull(),
    rounds: jsonb('rounds'),
    result: jsonb('result'),
    winnerId: uuid('winner_id'),
    attackerSnapshot: jsonb('attacker_snapshot'),
    defenderSnapshot: jsonb('defender_snapshot'),
    engineVersion: text('engine_version').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('battle_reports_attacker_id_idx').on(t.attackerId),
    index('battle_reports_defender_id_idx').on(t.defenderId),
    index('battle_reports_battle_type_idx').on(t.battleType),
  ],
);

// ─── Missions ───────────────────────────────────────────────────────────────

export const missions = pgTable(
  'missions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    missionType: text('mission_type').notNull(),
    targetCount: integer('target_count').notNull(),
    currentCount: integer('current_count').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    claimed: boolean('claimed').notNull().default(false),
    resetDate: date('reset_date').notNull(),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('missions_character_id_idx').on(t.characterId),
    index('missions_reset_date_idx').on(t.resetDate),
  ],
);

// ─── PvP Matches ────────────────────────────────────────────────────────────

export const pvpMatches = pgTable(
  'pvp_matches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attackerId: uuid('attacker_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'restrict' }),
    defenderId: uuid('defender_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'restrict' }),
    status: text('status', {
      enum: ['pending', 'completed', 'cancelled'],
    }).notNull(),
    battleReportId: uuid('battle_report_id').references(() => battleReports.id, {
      onDelete: 'set null',
    }),
    leaguePointsChange: integer('league_points_change').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [
    index('pvp_matches_attacker_id_idx').on(t.attackerId),
    index('pvp_matches_defender_id_idx').on(t.defenderId),
    index('pvp_matches_status_idx').on(t.status),
  ],
);

// ─── PvP Ratings ────────────────────────────────────────────────────────────

export const pvpRatings = pgTable(
  'pvp_ratings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' })
      .unique(),
    rating: integer('rating').notNull().default(1000),
    league: text('league', {
      enum: [
        'tieň',
        'železo',
        'krv',
        'mesiac',
        'prastarý',
        'vládca_noci',
      ],
    })
      .notNull()
      .default('tieň'),
    seasonPoints: integer('season_points').notNull().default(0),
    attacksToday: integer('attacks_today').notNull().default(0),
    lastAttackAt: timestamp('last_attack_at', { withTimezone: true }),
    lastDefendedAt: timestamp('last_defended_at', { withTimezone: true }),
  },
  (t) => [
    index('pvp_ratings_rating_idx').on(t.rating),
    index('pvp_ratings_league_idx').on(t.league),
  ],
);

// ─── Leaderboards ───────────────────────────────────────────────────────────

export const leaderboards = pgTable(
  'leaderboards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    boardType: text('board_type', {
      enum: ['level', 'pvp_rating', 'gold', 'power'],
    }).notNull(),
    value: integer('value').notNull(),
    period: text('period').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('leaderboards_character_id_idx').on(t.characterId),
    index('leaderboards_board_type_value_idx').on(t.boardType, t.value),
    index('leaderboards_period_idx').on(t.period),
  ],
);

// ─── Hideouts ───────────────────────────────────────────────────────────────

export const hideouts = pgTable('hideouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id')
    .notNull()
    .references(() => characters.id, { onDelete: 'cascade' })
    .unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Hideout Buildings ──────────────────────────────────────────────────────

export const hideoutBuildings = pgTable(
  'hideout_buildings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    hideoutId: uuid('hideout_id')
      .notNull()
      .references(() => hideouts.id, { onDelete: 'cascade' }),
    buildingType: text('building_type', {
      enum: ['main_hall', 'training_chamber', 'vault', 'workshop', 'guard_tower'],
    }).notNull(),
    level: integer('level').notNull().default(1),
    upgrading: boolean('upgrading').notNull().default(false),
    upgradeEndsAt: timestamp('upgrade_ends_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('hideout_buildings_hideout_id_idx').on(t.hideoutId),
  ],
);

// ─── Daily Rewards ──────────────────────────────────────────────────────────

export const dailyRewards = pgTable(
  'daily_rewards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    rewardDate: date('reward_date').notNull(),
    streakDay: integer('streak_day').notNull().default(1),
    claimed: boolean('claimed').notNull().default(false),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('daily_rewards_character_id_idx').on(t.characterId),
    index('daily_rewards_reward_date_idx').on(t.rewardDate),
  ],
);

// ─── Notifications ──────────────────────────────────────────────────────────

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    read: boolean('read').notNull().default(false),
    data: jsonb('data'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('notifications_character_id_idx').on(t.characterId),
    index('notifications_read_idx').on(t.read),
  ],
);

// ─── Currency Ledger ────────────────────────────────────────────────────────

export const currencyLedger = pgTable(
  'currency_ledger',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    currencyType: text('currency_type', {
      enum: ['gold', 'premium_crystals'],
    }).notNull(),
    balanceBefore: integer('balance_before').notNull(),
    changeAmount: integer('change_amount').notNull(),
    balanceAfter: integer('balance_after').notNull(),
    reason: text('reason').notNull(),
    sourceType: text('source_type').notNull(),
    sourceId: uuid('source_id'),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    adminId: uuid('admin_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    requestId: text('request_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('currency_ledger_character_id_idx').on(t.characterId),
    index('currency_ledger_source_type_source_id_idx').on(t.sourceType, t.sourceId),
    index('currency_ledger_admin_id_idx').on(t.adminId),
  ],
);

// ─── Purchases ──────────────────────────────────────────────────────────────

export const purchases = pgTable(
  'purchases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    itemName: text('item_name').notNull(),
    crystalAmount: integer('crystal_amount').notNull(),
    priceEur: integer('price_eur').notNull(),
    stripeSessionId: text('stripe_session_id').notNull(),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    status: text('status', {
      enum: ['pending', 'completed', 'failed', 'refunded'],
    }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('purchases_user_id_idx').on(t.userId),
    index('purchases_stripe_session_id_idx').on(t.stripeSessionId),
    index('purchases_status_idx').on(t.status),
  ],
);

// ─── Payment Events ─────────────────────────────────────────────────────────

export const paymentEvents = pgTable(
  'payment_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stripeEventId: text('stripe_event_id').notNull().unique(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload'),
    processed: boolean('processed').notNull().default(false),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('payment_events_processed_idx').on(t.processed),
    index('payment_events_event_type_idx').on(t.eventType),
  ],
);

// ─── Subscriptions ──────────────────────────────────────────────────────────

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripeSubscriptionId: text('stripe_subscription_id').notNull(),
    plan: text('plan').notNull(),
    status: text('status', {
      enum: ['active', 'canceled', 'past_due', 'trialing'],
    }).notNull(),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('subscriptions_user_id_idx').on(t.userId),
    index('subscriptions_stripe_subscription_id_idx').on(t.stripeSubscriptionId),
    index('subscriptions_status_idx').on(t.status),
  ],
);

// ─── Rewarded Ad Claims ─────────────────────────────────────────────────────

export const rewardedAdClaims = pgTable(
  'rewarded_ad_claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    adProvider: text('ad_provider').notNull(),
    rewardType: text('reward_type').notNull(),
    rewardAmount: integer('reward_amount').notNull(),
    claimed: boolean('claimed').notNull().default(false),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('rewarded_ad_claims_character_id_idx').on(t.characterId),
  ],
);

// ─── Economy Config ─────────────────────────────────────────────────────────

export const economyConfig = pgTable(
  'economy_config',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull().unique(),
    value: jsonb('value'),
    version: integer('version').notNull().default(1),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

// ─── Feature Flags ──────────────────────────────────────────────────────────

export const featureFlags = pgTable(
  'feature_flags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull().unique(),
    enabled: boolean('enabled').notNull().default(false),
    config: jsonb('config'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

// ─── Admin Audit Logs ───────────────────────────────────────────────────────

export const adminAuditLogs = pgTable(
  'admin_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: uuid('target_id'),
    details: jsonb('details'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('admin_audit_logs_admin_id_idx').on(t.adminId),
    index('admin_audit_logs_target_type_target_id_idx').on(t.targetType, t.targetId),
    index('admin_audit_logs_created_at_idx').on(t.createdAt),
  ],
);

// ─── Security Events ────────────────────────────────────────────────────────

export const securityEvents = pgTable(
  'security_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    eventType: text('event_type').notNull(),
    ipAddress: text('ip_address').notNull(),
    userAgent: text('user_agent'),
    details: jsonb('details'),
    severity: text('severity', {
      enum: ['low', 'medium', 'high', 'critical'],
    }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('security_events_user_id_idx').on(t.userId),
    index('security_events_event_type_idx').on(t.eventType),
    index('security_events_severity_idx').on(t.severity),
    index('security_events_created_at_idx').on(t.createdAt),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 03 — CLANS, SOCIAL, SEASONS, EVENTS, MODERATION
// ═══════════════════════════════════════════════════════════════════════════

// ─── Clans ─────────────────────────────────────────────────────────────────

export const clans = pgTable(
  'clans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    tag: text('tag').notNull().unique(),
    description: text('description').notNull().default(''),
    leaderId: uuid('leader_id').notNull().references(() => characters.id, { onDelete: 'restrict' }),
    factionId: uuid('faction_id').references(() => factions.id, { onDelete: 'set null' }),
    level: integer('level').notNull().default(1),
    experience: integer('experience').notNull().default(0),
    gold: integer('gold').notNull().default(0),
    maxMembers: integer('max_members').notNull().default(30),
    joinPolicy: text('join_policy', { enum: ['open', 'invite', 'closed'] }).notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('clans_leader_id_idx').on(t.leaderId),
    index('clans_faction_id_idx').on(t.factionId),
    index('clans_level_idx').on(t.level),
  ],
);

// ─── Clan Members ──────────────────────────────────────────────────────────

export const clanMembers = pgTable(
  'clan_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clanId: uuid('clan_id').notNull().references(() => clans.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    rank: text('rank', { enum: ['leader', 'officer', 'member', 'recruit'] }).notNull().default('recruit'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    contributionGold: integer('contribution_gold').notNull().default(0),
    contributionXp: integer('contribution_xp').notNull().default(0),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('clan_members_clan_id_idx').on(t.clanId),
    index('clan_members_character_id_idx').on(t.characterId),
    uniqueIndex('clan_members_clan_character_unique').on(t.clanId, t.characterId),
  ],
);

// ─── Clan Ranks (configurable) ────────────────────────────────────────────

export const clanRanks = pgTable(
  'clan_ranks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clanId: uuid('clan_id').notNull().references(() => clans.id, { onDelete: 'cascade' }),
    rankName: text('rank_name').notNull(),
    rankLevel: integer('rank_level').notNull(),
    canInvite: boolean('can_invite').notNull().default(false),
    canKick: boolean('can_kick').notNull().default(false),
    canDepositTreasury: boolean('can_deposit_treasury').notNull().default(true),
    canWithdrawTreasury: boolean('can_withdraw_treasury').notNull().default(false),
    canStartQuest: boolean('can_start_quest').notNull().default(false),
  },
  (t) => [
    index('clan_ranks_clan_id_idx').on(t.clanId),
    uniqueIndex('clan_ranks_clan_name_unique').on(t.clanId, t.rankName),
  ],
);

// ─── Clan Treasury Transactions ────────────────────────────────────────────

export const clanTreasury = pgTable(
  'clan_treasury',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clanId: uuid('clan_id').notNull().references(() => clans.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'restrict' }),
    amount: integer('amount').notNull(),
    reason: text('reason').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('clan_treasury_clan_id_idx').on(t.clanId),
    index('clan_treasury_character_id_idx').on(t.characterId),
  ],
);

// ─── Clan Quests ───────────────────────────────────────────────────────────

export const clanQuests = pgTable(
  'clan_quests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clanId: uuid('clan_id').notNull().references(() => clans.id, { onDelete: 'cascade' }),
    questType: text('quest_type').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    targetCount: integer('target_count').notNull(),
    currentCount: integer('current_count').notNull().default(0),
    rewardGold: integer('reward_gold').notNull().default(0),
    rewardXp: integer('reward_xp').notNull().default(0),
    rewardClanXp: integer('reward_clan_xp').notNull().default(0),
    status: text('status', { enum: ['active', 'completed', 'failed', 'claimed'] }).notNull().default('active'),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('clan_quests_clan_id_idx').on(t.clanId),
    index('clan_quests_status_idx').on(t.status),
  ],
);

// ─── Conversations ─────────────────────────────────────────────────────────

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type', { enum: ['direct', 'clan'] }).notNull(),
    clanId: uuid('clan_id').references(() => clans.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  },
  (t) => [
    index('conversations_type_idx').on(t.type),
    index('conversations_clan_id_idx').on(t.clanId),
  ],
);

// ─── Conversation Participants ─────────────────────────────────────────────

export const conversationParticipants = pgTable(
  'conversation_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    lastReadAt: timestamp('last_read_at', { withTimezone: true }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('conversation_participants_conversation_id_idx').on(t.conversationId),
    index('conversation_participants_character_id_idx').on(t.characterId),
    uniqueIndex('conv_participants_conv_character_unique').on(t.conversationId, t.characterId),
  ],
);

// ─── Messages ──────────────────────────────────────────────────────────────

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id').notNull().references(() => characters.id, { onDelete: 'restrict' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    editedAt: timestamp('edited_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('messages_conversation_id_idx').on(t.conversationId),
    index('messages_sender_id_idx').on(t.senderId),
    index('messages_created_at_idx').on(t.createdAt),
  ],
);

// ─── Friendships ───────────────────────────────────────────────────────────

export const friendships = pgTable(
  'friendships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    friendId: uuid('friend_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['pending', 'accepted', 'blocked'] }).notNull().default('pending'),
    requestedBy: uuid('requested_by').notNull().references(() => characters.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('friendships_character_id_idx').on(t.characterId),
    index('friendships_friend_id_idx').on(t.friendId),
    index('friendships_status_idx').on(t.status),
    uniqueIndex('friendships_pair_unique').on(t.characterId, t.friendId),
  ],
);

// ─── Player Reports ────────────────────────────────────────────────────────

export const playerReports = pgTable(
  'player_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reporterId: uuid('reporter_id').notNull().references(() => characters.id, { onDelete: 'restrict' }),
    reportedId: uuid('reported_id').notNull().references(() => characters.id, { onDelete: 'restrict' }),
    reason: text('reason', {
      enum: ['cheating', 'offensive_name', 'harassment', 'exploit', 'other'],
    }).notNull(),
    description: text('description'),
    battleReportId: uuid('battle_report_id').references(() => battleReports.id, { onDelete: 'set null' }),
    status: text('status', {
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    }).notNull().default('pending'),
    reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    resolution: text('resolution'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  },
  (t) => [
    index('player_reports_reporter_id_idx').on(t.reporterId),
    index('player_reports_reported_id_idx').on(t.reportedId),
    index('player_reports_status_idx').on(t.status),
  ],
);

// ─── Moderation Actions ────────────────────────────────────────────────────

export const moderationActions = pgTable(
  'moderation_actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moderatorId: uuid('moderator_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    targetCharacterId: uuid('target_character_id').references(() => characters.id, { onDelete: 'set null' }),
    targetUserId: uuid('target_user_id').references(() => users.id, { onDelete: 'set null' }),
    actionType: text('action_type', {
      enum: ['warning', 'mute', 'kick', 'ban', 'name_change', 'stat_reset', 'gold_revoke'],
    }).notNull(),
    reason: text('reason').notNull(),
    duration: integer('duration'),
    durationUnit: text('duration_unit', { enum: ['hours', 'days', 'permanent'] }),
    reportId: uuid('report_id').references(() => playerReports.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('moderation_actions_moderator_id_idx').on(t.moderatorId),
    index('moderation_actions_target_character_id_idx').on(t.targetCharacterId),
    index('moderation_actions_target_user_id_idx').on(t.targetUserId),
    index('moderation_actions_action_type_idx').on(t.actionType),
    index('moderation_actions_expires_at_idx').on(t.expiresAt),
  ],
);

// ─── Seasons ───────────────────────────────────────────────────────────────

export const seasons = pgTable(
  'seasons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    seasonNumber: integer('season_number').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    resetPvpRating: boolean('reset_pvp_rating').notNull().default(true),
    resetPvpWins: boolean('reset_pvp_wins').notNull().default(false),
    resetLeaderboards: boolean('reset_leaderboards').notNull().default(true),
    status: text('status', { enum: ['upcoming', 'active', 'ended'] }).notNull().default('upcoming'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('seasons_status_idx').on(t.status),
    index('seasons_season_number_idx').on(t.seasonNumber),
  ],
);

// ─── Season Rewards ────────────────────────────────────────────────────────

export const seasonRewards = pgTable(
  'season_rewards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    boardType: text('board_type', { enum: ['level', 'pvp_rating', 'gold', 'power'] }).notNull(),
    finalRank: integer('final_rank').notNull(),
    finalValue: integer('final_value').notNull(),
    rewardGold: integer('reward_gold').notNull().default(0),
    rewardCrystals: integer('reward_crystals').notNull().default(0),
    rewardTitle: text('reward_title'),
    claimed: boolean('claimed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('season_rewards_season_id_idx').on(t.seasonId),
    index('season_rewards_character_id_idx').on(t.characterId),
    uniqueIndex('season_rewards_season_char_board_unique').on(t.seasonId, t.characterId, t.boardType),
  ],
);

// ─── Live Events ───────────────────────────────────────────────────────────

export const liveEvents = pgTable(
  'live_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    eventType: text('event_type', {
      enum: ['boss_rush', 'double_xp', 'double_gold', 'festival', 'invasion', 'challenge'],
    }).notNull(),
    config: jsonb('config'),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    status: text('status', { enum: ['upcoming', 'active', 'ended'] }).notNull().default('upcoming'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('live_events_status_idx').on(t.status),
    index('live_events_starts_at_idx').on(t.startsAt),
    index('live_events_ends_at_idx').on(t.endsAt),
  ],
);

// ─── Live Event Participants ───────────────────────────────────────────────

export const liveEventParticipants = pgTable(
  'live_event_participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').notNull().references(() => liveEvents.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    score: integer('score').notNull().default(0),
    rewardClaimed: boolean('reward_claimed').notNull().default(false),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('live_event_participants_event_id_idx').on(t.eventId),
    index('live_event_participants_character_id_idx').on(t.characterId),
    uniqueIndex('live_event_part_char_unique').on(t.eventId, t.characterId),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 04 — MONETIZATION, COSMETICS, GDPR, ANALYTICS, RETENTION
// ═══════════════════════════════════════════════════════════════════════════

// ─── Cosmetic Items ────────────────────────────────────────────────────────

export const cosmeticItems = pgTable(
  'cosmetic_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: text('item_id').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    category: text('category', {
      enum: ['aura', 'mount', 'frame', 'background', 'title', 'pet'],
    }).notNull(),
    rarity: text('rarity', {
      enum: ['common', 'rare', 'epic', 'legendary'],
    }).notNull().default('common'),
    priceCrystals: integer('price_crystals'),
    membershipOnly: boolean('membership_only').notNull().default(false),
    seasonId: uuid('season_id').references(() => seasons.id, { onDelete: 'set null' }),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('cosmetic_items_category_idx').on(t.category),
    index('cosmetic_items_rarity_idx').on(t.rarity),
  ],
);

// ─── Character Cosmetics ───────────────────────────────────────────────────

export const characterCosmetics = pgTable(
  'character_cosmetics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    cosmeticItemId: uuid('cosmetic_item_id').notNull().references(() => cosmeticItems.id, { onDelete: 'cascade' }),
    equipped: boolean('equipped').notNull().default(false),
    slot: text('slot', {
      enum: ['aura', 'mount', 'frame', 'background', 'title', 'pet'],
    }).notNull(),
    purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('character_cosmetics_character_id_idx').on(t.characterId),
    index('character_cosmetics_equipped_idx').on(t.equipped),
    uniqueIndex('char_cosmetics_char_item_unique').on(t.characterId, t.cosmeticItemId),
  ],
);

// ─── Referral Codes ────────────────────────────────────────────────────────

export const referralCodes = pgTable(
  'referral_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    code: text('code').notNull().unique(),
    usesCount: integer('uses_count').notNull().default(0),
    maxUses: integer('max_uses').notNull().default(10),
    rewardPerUse: integer('reward_per_use').notNull().default(50),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('referral_codes_character_id_idx').on(t.characterId),
    index('referral_codes_code_idx').on(t.code),
  ],
);

// ─── Referral Rewards ──────────────────────────────────────────────────────

export const referralRewards = pgTable(
  'referral_rewards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    referrerId: uuid('referrer_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    referredId: uuid('referred_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    referralCodeId: uuid('referral_code_id').notNull().references(() => referralCodes.id, { onDelete: 'restrict' }),
    rewardGold: integer('reward_gold').notNull().default(0),
    rewardCrystals: integer('reward_crystals').notNull().default(0),
    rewardXp: integer('reward_xp').notNull().default(0),
    claimed: boolean('claimed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('referral_rewards_referrer_id_idx').on(t.referrerId),
    index('referral_rewards_referred_id_idx').on(t.referredId),
    uniqueIndex('referral_rewards_referrer_referred_unique').on(t.referrerId, t.referredId),
  ],
);

// ─── Season Pass ───────────────────────────────────────────────────────────

export const seasonPassTiers = pgTable(
  'season_pass_tiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
    tier: integer('tier').notNull(),
    requiredXp: integer('required_xp').notNull(),
    freeRewardGold: integer('free_reward_gold').notNull().default(0),
    freeRewardCrystals: integer('free_reward_crystals').notNull().default(0),
    freeRewardItemId: uuid('free_reward_item_id').references(() => itemTemplates.id, { onDelete: 'set null' }),
    premiumRewardGold: integer('premium_reward_gold').notNull().default(0),
    premiumRewardCrystals: integer('premium_reward_crystals').notNull().default(0),
    premiumRewardItemId: uuid('premium_reward_item_id').references(() => itemTemplates.id, { onDelete: 'set null' }),
    premiumRewardCosmeticId: uuid('premium_reward_cosmetic_id').references(() => cosmeticItems.id, { onDelete: 'set null' }),
  },
  (t) => [
    index('season_pass_tiers_season_id_idx').on(t.seasonId),
    uniqueIndex('season_pass_tiers_season_tier_unique').on(t.seasonId, t.tier),
  ],
);

// ─── Season Pass Progress ──────────────────────────────────────────────────

export const seasonPassProgress = pgTable(
  'season_pass_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    xp: integer('xp').notNull().default(0),
    currentTier: integer('current_tier').notNull().default(0),
    premiumUnlocked: boolean('premium_unlocked').notNull().default(false),
    claimedTiers: jsonb('claimed_tiers').notNull().default('[]'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('season_pass_progress_season_id_idx').on(t.seasonId),
    index('season_pass_progress_character_id_idx').on(t.characterId),
    uniqueIndex('season_pass_progress_season_char_unique').on(t.seasonId, t.characterId),
  ],
);

// ─── GDPR Requests ─────────────────────────────────────────────────────────

export const gdprRequests = pgTable(
  'gdpr_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    requestType: text('request_type', {
      enum: ['data_export', 'data_deletion', 'data_correction'],
    }).notNull(),
    status: text('status', {
      enum: ['pending', 'processing', 'completed', 'failed'],
    }).notNull().default('pending'),
    processedBy: uuid('processed_by').references(() => users.id, { onDelete: 'set null' }),
    downloadUrl: text('download_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [
    index('gdpr_requests_user_id_idx').on(t.userId),
    index('gdpr_requests_status_idx').on(t.status),
    index('gdpr_requests_request_type_idx').on(t.requestType),
  ],
);

// ─── Login Streaks ─────────────────────────────────────────────────────────

export const loginStreaks = pgTable(
  'login_streaks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
    currentStreak: integer('current_streak').notNull().default(1),
    longestStreak: integer('longest_streak').notNull().default(1),
    lastLoginDate: text('last_login_date').notNull(),
    totalLogins: integer('total_logins').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('login_streaks_character_id_idx').on(t.characterId),
    uniqueIndex('login_streaks_character_unique').on(t.characterId),
  ],
);

// ─── Beta Invites ──────────────────────────────────────────────────────

export const betaInvites = pgTable(
  'beta_invites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(),
    createdByAdminId: uuid('created_by_admin_id').notNull().references(() => users.id, {
      onDelete: 'restrict',
    }),
    usageLimit: integer('usage_limit').notNull().default(10),
    usesCount: integer('uses_count').notNull().default(0),
    status: text('status', { enum: ['active', 'disabled', 'expired'] })
      .notNull()
      .default('active'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('beta_invites_created_by_admin_id_idx').on(t.createdByAdminId),
    index('beta_invites_status_idx').on(t.status),
  ],
);

// ─── Beta Access ───────────────────────────────────────────────────────

export const betaAccess = pgTable(
  'beta_access',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    inviteId: uuid('invite_id')
      .notNull()
      .references(() => betaInvites.id, { onDelete: 'restrict' }),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    status: text('status', { enum: ['active', 'revoked'] })
      .notNull()
      .default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('beta_access_user_id_idx').on(t.userId),
    index('beta_access_invite_id_idx').on(t.inviteId),
    index('beta_access_status_idx').on(t.status),
  ],
);

// ─── Background Jobs ───────────────────────────────────────────────────

export const backgroundJobs = pgTable(
  'background_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobType: text('job_type').notNull(),
    payload: jsonb('payload'),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    priority: integer('priority').notNull().default(5),
    status: text('status', {
      enum: ['pending', 'processing', 'completed', 'failed', 'dead'],
    })
      .notNull()
      .default('pending'),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(3),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('background_jobs_status_idx').on(t.status),
    index('background_jobs_priority_scheduled_at_idx').on(t.priority, t.scheduledAt),
    index('background_jobs_job_type_idx').on(t.jobType),
  ],
);

// ─── Outbox Events ─────────────────────────────────────────────────────

export const outboxEvents = pgTable(
  'outbox_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    aggregateType: text('aggregate_type').notNull(),
    aggregateId: text('aggregate_id').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload'),
    status: text('status', { enum: ['pending', 'processed', 'failed'] })
      .notNull()
      .default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (t) => [
    index('outbox_events_status_idx').on(t.status),
    index('outbox_events_aggregate_type_aggregate_id_idx').on(t.aggregateType, t.aggregateId),
    index('outbox_events_event_type_idx').on(t.eventType),
  ],
);

// ─── System Audit Logs ─────────────────────────────────────────────────

export const systemAuditLogs = pgTable(
  'system_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: text('actor_id'),
    actorType: text('actor_type', { enum: ['user', 'admin', 'system'] }).notNull(),
    action: text('action').notNull(),
    targetType: text('target_type'),
    targetId: text('target_id'),
    details: jsonb('details'),
    requestId: text('request_id'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('system_audit_logs_actor_type_idx').on(t.actorType),
    index('system_audit_logs_action_idx').on(t.action),
    index('system_audit_logs_target_type_target_id_idx').on(t.targetType, t.targetId),
    index('system_audit_logs_created_at_idx').on(t.createdAt),
  ],
);

// ─── Bug Reports ───────────────────────────────────────────────────────

export const bugReports = pgTable(
  'bug_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').references(() => characters.id, {
      onDelete: 'set null',
    }),
    category: text('category', {
      enum: ['bug', 'feature', 'balance', 'payment', 'moderation', 'general'],
    }).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    steps: text('steps'),
    expected: text('expected'),
    actual: text('actual'),
    screenshotUrl: text('screenshot_url'),
    releaseId: text('release_id'),
    route: text('route'),
    browserInfo: text('browser_info'),
    status: text('status', {
      enum: ['open', 'investigating', 'fixed', 'wontfix', 'duplicate'],
    })
      .notNull()
      .default('open'),
    assignedTo: text('assigned_to'),
    adminNotes: text('admin_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('bug_reports_user_id_idx').on(t.userId),
    index('bug_reports_character_id_idx').on(t.characterId),
    index('bug_reports_category_idx').on(t.category),
    index('bug_reports_status_idx').on(t.status),
  ],
);

// ─── Feedback ──────────────────────────────────────────────────────────

export const feedback = pgTable(
  'feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    characterId: uuid('character_id').references(() => characters.id, {
      onDelete: 'set null',
    }),
    category: text('category', {
      enum: ['bug', 'feature', 'balance', 'payment', 'moderation', 'general'],
    }).notNull(),
    priority: text('priority', { enum: ['low', 'medium', 'high', 'critical'] })
      .notNull()
      .default('medium'),
    title: text('title').notNull(),
    content: text('content').notNull(),
    status: text('status', {
      enum: ['new', 'acknowledged', 'in_progress', 'resolved', 'closed'],
    })
      .notNull()
      .default('new'),
    adminResponse: text('admin_response'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('feedback_user_id_idx').on(t.userId),
    index('feedback_character_id_idx').on(t.characterId),
    index('feedback_category_idx').on(t.category),
    index('feedback_priority_idx').on(t.priority),
    index('feedback_status_idx').on(t.status),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 06 TABLES — STORY, MATERIALS, CRAFTING, AUCTION, CLAN WARS, WORLD MAP, PUSH
// ═══════════════════════════════════════════════════════════════════════════

// ─── Story Campaigns ──────────────────────────────────────────────────────

export const storyCampaigns = pgTable('story_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nameKey: text('name_key').notNull(),
  descriptionKey: text('description_key').notNull(),
  status: text('status', { enum: ['draft', 'active', 'completed', 'archived'] }).notNull().default('draft'),
  minimumLevel: integer('minimum_level').notNull().default(1),
  maximumLevel: integer('maximum_level').notNull().default(50),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const storyChapters = pgTable('story_chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => storyCampaigns.id),
  slug: text('slug').notNull(),
  nameKey: text('name_key').notNull(),
  descriptionKey: text('description_key').notNull(),
  chapterOrder: integer('chapter_order').notNull(),
  unlockConditions: jsonb('unlock_conditions').notNull().default('{}'),
  enabled: boolean('enabled').notNull().default(true),
}, (t) => [
  index('story_chapters_campaign_id_idx').on(t.campaignId),
]);

export const storyMissions = pgTable('story_missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  chapterId: uuid('chapter_id').notNull().references(() => storyChapters.id),
  slug: text('slug').notNull(),
  nameKey: text('name_key').notNull(),
  descriptionKey: text('description_key').notNull(),
  missionType: text('mission_type', { enum: ['tutorial', 'combat', 'exploration', 'investigation', 'dialogue', 'decision', 'boss', 'ending', 'side_quest'] }).notNull(),
  objectiveConfig: jsonb('objective_config').notNull().default('{}'),
  encounterConfig: jsonb('encounter_config'),
  rewardConfig: jsonb('reward_config').notNull().default('{}'),
  prerequisiteMissionId: uuid('prerequisite_mission_id'),
  unlockConditions: jsonb('unlock_conditions').notNull().default('{}'),
  failureConditions: jsonb('failure_conditions'),
  repeatable: boolean('repeatable').notNull().default(false),
  enabled: boolean('enabled').notNull().default(true),
}, (t) => [
  index('story_missions_chapter_id_idx').on(t.chapterId),
]);

export const characterStoryProgress = pgTable('character_story_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  campaignId: uuid('campaign_id').notNull().references(() => storyCampaigns.id),
  currentChapterId: uuid('current_chapter_id'),
  currentMissionId: uuid('current_mission_id'),
  state: text('state', { enum: ['not_started', 'in_progress', 'completed', 'abandoned'] }).notNull().default('not_started'),
  completedMissions: jsonb('completed_missions').notNull().default('[]'),
  decisions: jsonb('decisions').notNull().default('[]'),
  flags: jsonb('flags').notNull().default('{}'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('character_story_progress_char_camp_idx').on(t.characterId, t.campaignId),
  index('character_story_progress_character_id_idx').on(t.characterId),
]);

export const storyDecisions = pgTable('story_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  missionId: uuid('mission_id').notNull().references(() => storyMissions.id),
  decisionKey: text('decision_key').notNull(),
  optionKey: text('option_key').notNull(),
  consequenceConfig: jsonb('consequence_config').notNull().default('{}'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('story_decisions_mission_id_idx').on(t.missionId),
]);

export const characterStoryDecisions = pgTable('character_story_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  storyDecisionId: uuid('story_decision_id').notNull().references(() => storyDecisions.id),
  selectedOption: text('selected_option').notNull(),
  consequenceSnapshot: jsonb('consequence_snapshot').notNull().default('{}'),
  selectedAt: timestamp('selected_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('char_story_decision_char_decision_idx').on(t.characterId, t.storyDecisionId),
  index('character_story_decisions_character_id_idx').on(t.characterId),
]);

// ─── Reputation ───────────────────────────────────────────────────────────

export const characterReputation = pgTable('character_reputation', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  organizationSlug: text('organization_slug').notNull(),
  reputation: integer('reputation').notNull().default(0),
  tier: text('tier', { enum: ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored', 'revered', 'exalted'] }).notNull().default('neutral'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('char_reputation_char_org_idx').on(t.characterId, t.organizationSlug),
]);

// ─── Materials ────────────────────────────────────────────────────────────

export const materialTemplates = pgTable('material_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nameKey: text('name_key').notNull(),
  descriptionKey: text('description_key').notNull(),
  rarity: text('rarity', { enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'cursed'] }).notNull().default('common'),
  stackLimit: integer('stack_limit').notNull().default(999),
  tradable: boolean('tradable').notNull().default(true),
  assetKey: text('asset_key'),
  enabled: boolean('enabled').notNull().default(true),
});

export const characterMaterials = pgTable('character_materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  materialTemplateId: uuid('material_template_id').notNull().references(() => materialTemplates.id),
  quantity: integer('quantity').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('char_material_char_mat_idx').on(t.characterId, t.materialTemplateId),
  index('characterMaterials_character_id_idx').on(t.characterId),
]);

export const materialLedger = pgTable('material_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  materialTemplateId: uuid('material_template_id').notNull().references(() => materialTemplates.id),
  quantityBefore: integer('quantity_before').notNull(),
  delta: integer('delta').notNull(),
  quantityAfter: integer('quantity_after').notNull(),
  reason: text('reason').notNull(),
  sourceType: text('source_type').notNull(),
  sourceId: text('source_id'),
  idempotencyKey: text('idempotency_key').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('material_ledger_character_id_idx').on(t.characterId),
  index('material_ledger_material_template_id_idx').on(t.materialTemplateId),
]);

// ─── Crafting ─────────────────────────────────────────────────────────────

export const craftingRecipeTemplates = pgTable('crafting_recipe_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nameKey: text('name_key').notNull(),
  descriptionKey: text('description_key').notNull(),
  outputType: text('output_type', { enum: ['item', 'material'] }).notNull(),
  outputTemplateId: text('output_template_id').notNull(),
  outputQuantity: integer('output_quantity').notNull().default(1),
  materialsRequired: jsonb('materials_required').notNull().default('[]'),
  goldCost: integer('gold_cost').notNull().default(0),
  durationSeconds: integer('duration_seconds').notNull().default(60),
  unlockConditions: jsonb('unlock_conditions').notNull().default('{}'),
  successRate: integer('success_rate').notNull().default(100),
  failureConfig: jsonb('failure_config'),
  enabled: boolean('enabled').notNull().default(true),
});

export const characterRecipeUnlocks = pgTable('character_recipe_unlocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  recipeTemplateId: uuid('recipe_template_id').notNull().references(() => craftingRecipeTemplates.id),
  unlockSource: text('unlock_source').notNull(),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('char_recipe_unlock_char_recipe_idx').on(t.characterId, t.recipeTemplateId),
]);

export const craftingJobs = pgTable('crafting_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  recipeTemplateId: uuid('recipe_template_id').notNull().references(() => craftingRecipeTemplates.id),
  status: text('status', { enum: ['pending', 'crafting', 'completed', 'failed', 'cancelled'] }).notNull().default('pending'),
  inputSnapshot: jsonb('input_snapshot').notNull().default('{}'),
  outputSnapshot: jsonb('output_snapshot'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
  idempotencyKey: text('idempotency_key').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('crafting_jobs_character_id_idx').on(t.characterId),
  index('crafting_jobs_status_idx').on(t.status),
]);

// ─── Item Upgrades ────────────────────────────────────────────────────────

export const itemUpgradeLogs = pgTable('item_upgrade_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  characterItemId: uuid('character_item_id').notNull().references(() => characterItems.id),
  levelBefore: integer('level_before').notNull().default(0),
  levelAfter: integer('level_after').notNull(),
  success: boolean('success').notNull(),
  costSnapshot: jsonb('cost_snapshot').notNull().default('{}'),
  randomSeed: text('random_seed'),
  configVersion: text('config_version').notNull().default('1.0.0'),
  idempotencyKey: text('idempotency_key').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('item_upgrade_logs_character_item_id_idx').on(t.characterItemId),
]);

// ─── Auction ──────────────────────────────────────────────────────────────

export const auctionListings = pgTable('auction_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerCharacterId: uuid('seller_character_id').notNull().references(() => characters.id),
  listingType: text('listing_type', { enum: ['item', 'material'] }).notNull(),
  itemId: uuid('item_id').references(() => characterItems.id),
  materialTemplateId: uuid('material_template_id').references(() => materialTemplates.id),
  quantity: integer('quantity').notNull().default(1),
  pricePerUnit: integer('price_per_unit').notNull(),
  totalPrice: integer('total_price').notNull(),
  currency: text('currency', { enum: ['gold'] }).notNull().default('gold'),
  status: text('status', { enum: ['active', 'sold', 'expired', 'cancelled', 'suspended'] }).notNull().default('active'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  soldAt: timestamp('sold_at', { withTimezone: true }),
  buyerCharacterId: uuid('buyer_character_id').references(() => characters.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('auction_listings_seller_idx').on(t.sellerCharacterId),
  index('auction_listings_status_idx').on(t.status),
  index('auction_listings_ends_at_idx').on(t.endsAt),
]);

export const auctionTransactions = pgTable('auction_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').notNull().references(() => auctionListings.id),
  sellerCharacterId: uuid('seller_character_id').notNull().references(() => characters.id),
  buyerCharacterId: uuid('buyer_character_id').notNull().references(() => characters.id),
  grossAmount: integer('gross_amount').notNull(),
  feeAmount: integer('fee_amount').notNull(),
  netAmount: integer('net_amount').notNull(),
  itemSnapshot: jsonb('item_snapshot'),
  idempotencyKey: text('idempotency_key').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('auction_transactions_listing_idx').on(t.listingId),
  index('auction_transactions_seller_idx').on(t.sellerCharacterId),
  index('auction_transactions_buyer_idx').on(t.buyerCharacterId),
]);

export const auctionPriceHistory = pgTable('auction_price_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateType: text('template_type').notNull(),
  templateId: text('template_id').notNull(),
  averagePrice: integer('average_price').notNull(),
  minimumPrice: integer('minimum_price').notNull(),
  maximumPrice: integer('maximum_price').notNull(),
  medianPrice: integer('median_price').notNull(),
  volume: integer('volume').notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
}, (t) => [
  index('auction_price_history_template_idx').on(t.templateType, t.templateId),
]);

// ─── Clan Wars ────────────────────────────────────────────────────────────

export const clanWars = pgTable('clan_wars', {
  id: uuid('id').primaryKey().defaultRandom(),
  attackerClanId: uuid('attacker_clan_id').notNull().references(() => clans.id),
  defenderClanId: uuid('defender_clan_id').notNull().references(() => clans.id),
  status: text('status', { enum: ['proposed', 'accepted', 'scheduled', 'active', 'resolving', 'completed', 'cancelled'] }).notNull().default('proposed'),
  warType: text('war_type', { enum: ['standard', 'territory', 'seasonal'] }).notNull().default('standard'),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  scoringConfig: jsonb('scoring_config').notNull().default('{}'),
  attackerScore: integer('attacker_score').notNull().default(0),
  defenderScore: integer('defender_score').notNull().default(0),
  winnerClanId: uuid('winner_clan_id').references(() => clans.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
}, (t) => [
  index('clan_wars_attacker_idx').on(t.attackerClanId),
  index('clan_wars_defender_idx').on(t.defenderClanId),
  index('clan_wars_status_idx').on(t.status),
]);

export const clanWarParticipants = pgTable('clan_war_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  clanWarId: uuid('clan_war_id').notNull().references(() => clanWars.id),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  clanId: uuid('clan_id').notNull().references(() => clans.id),
  status: text('status', { enum: ['active', 'exhausted', 'eliminated'] }).notNull().default('active'),
  contributionScore: integer('contribution_score').notNull().default(0),
  attacksUsed: integer('attacks_used').notNull().default(0),
  defensesCount: integer('defenses_count').notNull().default(0),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('clan_war_participants_war_idx').on(t.clanWarId),
  index('clan_war_participants_character_idx').on(t.characterId),
]);

export const clanWarBattles = pgTable('clan_war_battles', {
  id: uuid('id').primaryKey().defaultRandom(),
  clanWarId: uuid('clan_war_id').notNull().references(() => clanWars.id),
  attackerCharacterId: uuid('attacker_character_id').notNull().references(() => characters.id),
  defenderCharacterId: uuid('defender_character_id').notNull().references(() => characters.id),
  battleReportId: uuid('battle_report_id').references(() => battleReports.id),
  scoreAwarded: integer('score_awarded').notNull().default(0),
  idempotencyKey: text('idempotency_key').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('clan_war_battles_war_idx').on(t.clanWarId),
]);

export const clanWarRewards = pgTable('clan_war_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  clanWarId: uuid('clan_war_id').notNull().references(() => clanWars.id),
  clanId: uuid('clan_id').notNull().references(() => clans.id),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  rewardPayload: jsonb('reward_payload').notNull().default('{}'),
  contributionRequirement: integer('contribution_requirement').notNull().default(1),
  idempotencyKey: text('idempotency_key').unique(),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
}, (t) => [
  index('clan_war_rewards_war_idx').on(t.clanWarId),
  index('clan_war_rewards_character_idx').on(t.characterId),
]);

// ─── World Map & Territories ──────────────────────────────────────────────

export const worldRegions = pgTable('world_regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nameKey: text('name_key').notNull(),
  descriptionKey: text('description_key').notNull(),
  levelMin: integer('level_min').notNull().default(1),
  levelMax: integer('level_max').notNull().default(50),
  mapPosition: jsonb('map_position').notNull().default('{}'),
  visualConfig: jsonb('visual_config').notNull().default('{}'),
  resourceConfig: jsonb('resource_config').notNull().default('{}'),
  enabled: boolean('enabled').notNull().default(true),
});

export const territoryNodes = pgTable('territory_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  regionId: uuid('region_id').notNull().references(() => worldRegions.id),
  slug: text('slug').notNull().unique(),
  nameKey: text('name_key').notNull(),
  nodeType: text('node_type', { enum: ['fortress', 'mine', 'sanctuary', 'trade_route', 'watchtower', 'relic_site'] }).notNull(),
  ownerType: text('owner_type', { enum: ['faction', 'clan', 'none'] }).notNull().default('none'),
  ownerClanId: uuid('owner_clan_id').references(() => clans.id),
  ownerFactionId: uuid('owner_faction_id').references(() => factions.id),
  status: text('status', { enum: ['neutral', 'contested', 'controlled', 'locked'] }).notNull().default('neutral'),
  defenseLevel: integer('defense_level').notNull().default(0),
  scoringConfig: jsonb('scoring_config').notNull().default('{}'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('territory_nodes_region_idx').on(t.regionId),
  index('territory_nodes_owner_clan_idx').on(t.ownerClanId),
]);

export const territoryControlHistory = pgTable('territory_control_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  territoryNodeId: uuid('territory_node_id').notNull().references(() => territoryNodes.id),
  previousOwnerType: text('previous_owner_type', { enum: ['faction', 'clan', 'none'] }),
  previousOwnerId: uuid('previous_owner_id'),
  newOwnerType: text('new_owner_type', { enum: ['faction', 'clan', 'none'] }).notNull(),
  newOwnerId: uuid('new_owner_id'),
  causeType: text('cause_type').notNull(),
  causeId: text('cause_id'),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('territory_control_history_node_idx').on(t.territoryNodeId),
]);

export const factionGoalsTable = pgTable('faction_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  seasonId: uuid('season_id').references(() => seasons.id),
  factionId: uuid('faction_id').notNull().references(() => factions.id),
  goalType: text('goal_type').notNull(),
  currentScore: integer('current_score').notNull().default(0),
  targetScore: integer('target_score').notNull().default(1000),
  rewardConfig: jsonb('reward_config').notNull().default('{}'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('faction_goals_season_idx').on(t.seasonId),
  index('faction_goals_faction_idx').on(t.factionId),
]);

// ─── World Boss ───────────────────────────────────────────────────────────

export const worldBosses = pgTable('world_bosses', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nameKey: text('name_key').notNull(),
  descriptionKey: text('description_key').notNull(),
  regionId: uuid('region_id').references(() => worldRegions.id),
  maxHp: integer('max_hp').notNull(),
  currentHp: integer('current_hp').notNull(),
  level: integer('level').notNull(),
  mechanics: jsonb('mechanics').notNull().default('[]'),
  lootTable: jsonb('loot_table').notNull().default('[]'),
  status: text('status', { enum: ['inactive', 'active', 'defeated', 'respawning'] }).notNull().default('inactive'),
  spawnsAt: timestamp('spawns_at', { withTimezone: true }),
  defeatedAt: timestamp('defeated_at', { withTimezone: true }),
  respawnAt: timestamp('respawn_at', { withTimezone: true }),
  dailyAttemptsPerPlayer: integer('daily_attempts_per_player').notNull().default(3),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('world_bosses_status_idx').on(t.status),
  index('world_bosses_region_idx').on(t.regionId),
]);

export const worldBossContributions = pgTable('world_boss_contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  worldBossId: uuid('world_boss_id').notNull().references(() => worldBosses.id),
  characterId: uuid('character_id').notNull().references(() => characters.id),
  totalDamage: integer('total_damage').notNull().default(0),
  attemptsUsed: integer('attempts_used').notNull().default(0),
  rewardClaimed: boolean('reward_claimed').notNull().default(false),
  contributedAt: timestamp('contributed_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('world_boss_contrib_boss_char_idx').on(t.worldBossId, t.characterId),
  index('worldBossContributions_character_id_idx').on(t.characterId),
]);

// ─── Push Notifications ───────────────────────────────────────────────────

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  endpointHash: text('endpoint_hash').notNull(),
  encryptedSubscriptionPayload: text('encrypted_subscription_payload').notNull(),
  userAgentSummary: text('user_agent_summary'),
  status: text('status', { enum: ['active', 'expired', 'revoked'] }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
}, (t) => [
  index('push_subscriptions_user_idx').on(t.userId),
  index('push_subscriptions_status_idx').on(t.status),
]);

export const pushNotificationPreferences = pgTable('push_notification_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  expeditionComplete: boolean('expedition_complete').notNull().default(true),
  craftingComplete: boolean('crafting_complete').notNull().default(true),
  hideoutComplete: boolean('hideout_complete').notNull().default(true),
  clanWar: boolean('clan_war').notNull().default(true),
  clanBoss: boolean('clan_boss').notNull().default(true),
  auctionSale: boolean('auction_sale').notNull().default(true),
  seasonEvent: boolean('season_event').notNull().default(true),
  marketing: boolean('marketing').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pushDeliveryLogs = pgTable('push_delivery_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  notificationType: text('notification_type').notNull(),
  providerMessageId: text('provider_message_id'),
  status: text('status', { enum: ['sent', 'delivered', 'failed', 'expired'] }).notNull(),
  errorCode: text('error_code'),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('push_delivery_logs_user_idx').on(t.userId),
  index('push_delivery_logs_type_idx').on(t.notificationType),
]);

// ─── Content Management ───────────────────────────────────────────────────

export const contentVersions = pgTable('content_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentType: text('content_type').notNull(),
  contentId: text('content_id').notNull(),
  version: integer('version').notNull().default(1),
  snapshot: jsonb('snapshot').notNull().default('{}'),
  publishedBy: text('published_by'),
  status: text('status', { enum: ['draft', 'review', 'published', 'archived'] }).notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('content_versions_type_id_idx').on(t.contentType, t.contentId),
]);

// ─── Live-Ops ─────────────────────────────────────────────────────────────

export const liveOpsEvents = pgTable('live_ops_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: text('event_type', { enum: ['chapter_release', 'boss_event', 'crafting_weekend', 'territory_season', 'faction_challenge', 'world_boss_event', 'auction_event'] }).notNull(),
  nameKey: text('name_key').notNull(),
  descriptionKey: text('description_key').notNull(),
  config: jsonb('config').notNull().default('{}'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  status: text('status', { enum: ['scheduled', 'active', 'completed', 'cancelled'] }).notNull().default('scheduled'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('live_ops_events_status_idx').on(t.status),
  index('live_ops_events_starts_at_idx').on(t.startsAt),
]);

// ─── Patch Notes ──────────────────────────────────────────────────────────

export const patchNotes = pgTable('patch_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  version: text('version').notNull().unique(),
  titleKey: text('title_key').notNull(),
  contentKey: text('content_key').notNull(),
  category: text('category', { enum: ['feature', 'balance', 'fix', 'security', 'known_issue'] }).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  character: one(characters, {
    fields: [users.id],
    references: [characters.userId],
  }),
  purchases: many(purchases),
  subscriptions: many(subscriptions),
  securityEvents: many(securityEvents),
  adminAuditLogs: many(adminAuditLogs),
  betaInvitesCreated: many(betaInvites),
  betaAccessGrants: many(betaAccess),
  bugReports: many(bugReports),
  feedback: many(feedback),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const factionsRelations = relations(factions, ({ many }) => ({
  characters: many(characters),
  itemTemplates: many(itemTemplates),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
  faction: one(factions, {
    fields: [characters.factionId],
    references: [factions.id],
  }),
  stats: one(characterStats, {
    fields: [characters.id],
    references: [characterStats.characterId],
  }),
  resources: one(characterResources, {
    fields: [characters.id],
    references: [characterResources.characterId],
  }),
  items: many(characterItems),
  equipmentSlots: many(equipmentSlots),
  activities: many(activities),
  expeditions: many(expeditions),
  missions: many(missions),
  pvpRatings: one(pvpRatings, {
    fields: [characters.id],
    references: [pvpRatings.characterId],
  }),
  pvpAttacks: many(pvpMatches, { relationName: 'attacker' }),
  pvpDefenses: many(pvpMatches, { relationName: 'defender' }),
  hideout: one(hideouts, {
    fields: [characters.id],
    references: [hideouts.characterId],
  }),
  dailyRewards: many(dailyRewards),
  notifications: many(notifications),
  currencyLedger: many(currencyLedger),
  leaderboardEntries: many(leaderboards),
  rewardedAdClaims: many(rewardedAdClaims),
  clanMemberships: many(clanMembers),
  sentMessages: many(messages),
  friendshipsAsCharacter: many(friendships, { relationName: 'character' }),
  friendshipsAsFriend: many(friendships, { relationName: 'friend' }),
  reportsFiled: many(playerReports, { relationName: 'reporter' }),
  reportsReceived: many(playerReports, { relationName: 'reported' }),
  liveEventParticipations: many(liveEventParticipants),
  cosmetics: many(characterCosmetics),
  referralCodes: many(referralCodes),
  loginStreak: one(loginStreaks),
  bugReports: many(bugReports),
  feedback: many(feedback),
}));

export const characterStatsRelations = relations(characterStats, ({ one }) => ({
  character: one(characters, {
    fields: [characterStats.characterId],
    references: [characters.id],
  }),
}));

export const characterResourcesRelations = relations(characterResources, ({ one }) => ({
  character: one(characters, {
    fields: [characterResources.characterId],
    references: [characters.id],
  }),
}));

export const itemTemplatesRelations = relations(itemTemplates, ({ one, many }) => ({
  factionRestrictionFaction: one(factions, {
    fields: [itemTemplates.factionRestriction],
    references: [factions.id],
  }),
  characterItems: many(characterItems),
  activityRewards: many(activityRewards),
}));

export const characterItemsRelations = relations(characterItems, ({ one }) => ({
  character: one(characters, {
    fields: [characterItems.characterId],
    references: [characters.id],
  }),
  template: one(itemTemplates, {
    fields: [characterItems.templateId],
    references: [itemTemplates.id],
  }),
}));

export const equipmentSlotsRelations = relations(equipmentSlots, ({ one }) => ({
  character: one(characters, {
    fields: [equipmentSlots.characterId],
    references: [characters.id],
  }),
  item: one(characterItems, {
    fields: [equipmentSlots.itemId],
    references: [characterItems.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  character: one(characters, {
    fields: [activities.characterId],
    references: [characters.id],
  }),
  rewards: many(activityRewards),
}));

export const activityRewardsRelations = relations(activityRewards, ({ one }) => ({
  activity: one(activities, {
    fields: [activityRewards.activityId],
    references: [activities.id],
  }),
  character: one(characters, {
    fields: [activityRewards.characterId],
    references: [characters.id],
  }),
  item: one(itemTemplates, {
    fields: [activityRewards.itemId],
    references: [itemTemplates.id],
  }),
}));

export const regionsRelations = relations(regions, ({ many }) => ({
  enemies: many(enemies),
  expeditions: many(expeditions),
}));

export const enemiesRelations = relations(enemies, ({ one }) => ({
  region: one(regions, {
    fields: [enemies.regionId],
    references: [regions.id],
  }),
}));

export const expeditionsRelations = relations(expeditions, ({ one }) => ({
  character: one(characters, {
    fields: [expeditions.characterId],
    references: [characters.id],
  }),
  region: one(regions, {
    fields: [expeditions.regionId],
    references: [regions.id],
  }),
}));

export const battleReportsRelations = relations(battleReports, ({ one }) => ({
  attacker: one(characters, {
    fields: [battleReports.attackerId],
    references: [characters.id],
  }),
  defender: one(characters, {
    fields: [battleReports.defenderId],
    references: [characters.id],
  }),
}));

export const missionsRelations = relations(missions, ({ one }) => ({
  character: one(characters, {
    fields: [missions.characterId],
    references: [characters.id],
  }),
}));

export const pvpMatchesRelations = relations(pvpMatches, ({ one }) => ({
  attacker: one(characters, {
    fields: [pvpMatches.attackerId],
    references: [characters.id],
    relationName: 'attacker',
  }),
  defender: one(characters, {
    fields: [pvpMatches.defenderId],
    references: [characters.id],
    relationName: 'defender',
  }),
  battleReport: one(battleReports, {
    fields: [pvpMatches.battleReportId],
    references: [battleReports.id],
  }),
}));

export const pvpRatingsRelations = relations(pvpRatings, ({ one }) => ({
  character: one(characters, {
    fields: [pvpRatings.characterId],
    references: [characters.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  character: one(characters, {
    fields: [leaderboards.characterId],
    references: [characters.id],
  }),
}));

export const hideoutsRelations = relations(hideouts, ({ one, many }) => ({
  character: one(characters, {
    fields: [hideouts.characterId],
    references: [characters.id],
  }),
  buildings: many(hideoutBuildings),
}));

export const hideoutBuildingsRelations = relations(hideoutBuildings, ({ one }) => ({
  hideout: one(hideouts, {
    fields: [hideoutBuildings.hideoutId],
    references: [hideouts.id],
  }),
}));

export const dailyRewardsRelations = relations(dailyRewards, ({ one }) => ({
  character: one(characters, {
    fields: [dailyRewards.characterId],
    references: [characters.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  character: one(characters, {
    fields: [notifications.characterId],
    references: [characters.id],
  }),
}));

export const currencyLedgerRelations = relations(currencyLedger, ({ one }) => ({
  character: one(characters, {
    fields: [currencyLedger.characterId],
    references: [characters.id],
  }),
  admin: one(users, {
    fields: [currencyLedger.adminId],
    references: [users.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const rewardedAdClaimsRelations = relations(rewardedAdClaims, ({ one }) => ({
  character: one(characters, {
    fields: [rewardedAdClaims.characterId],
    references: [characters.id],
  }),
}));

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLogs.adminId],
    references: [users.id],
  }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 03 RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const clansRelations = relations(clans, ({ one, many }) => ({
  leader: one(characters, {
    fields: [clans.leaderId],
    references: [characters.id],
  }),
  faction: one(factions, {
    fields: [clans.factionId],
    references: [factions.id],
  }),
  members: many(clanMembers),
  ranks: many(clanRanks),
  treasuryTransactions: many(clanTreasury),
  quests: many(clanQuests),
}));

export const clanMembersRelations = relations(clanMembers, ({ one }) => ({
  clan: one(clans, {
    fields: [clanMembers.clanId],
    references: [clans.id],
  }),
  character: one(characters, {
    fields: [clanMembers.characterId],
    references: [characters.id],
  }),
}));

export const clanRanksRelations = relations(clanRanks, ({ one }) => ({
  clan: one(clans, {
    fields: [clanRanks.clanId],
    references: [clans.id],
  }),
}));

export const clanTreasuryRelations = relations(clanTreasury, ({ one }) => ({
  clan: one(clans, {
    fields: [clanTreasury.clanId],
    references: [clans.id],
  }),
  character: one(characters, {
    fields: [clanTreasury.characterId],
    references: [characters.id],
  }),
}));

export const clanQuestsRelations = relations(clanQuests, ({ one }) => ({
  clan: one(clans, {
    fields: [clanQuests.clanId],
    references: [clans.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  clan: one(clans, {
    fields: [conversations.clanId],
    references: [clans.id],
  }),
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  character: one(characters, {
    fields: [conversationParticipants.characterId],
    references: [characters.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(characters, {
    fields: [messages.senderId],
    references: [characters.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  character: one(characters, {
    fields: [friendships.characterId],
    references: [characters.id],
    relationName: 'character',
  }),
  friend: one(characters, {
    fields: [friendships.friendId],
    references: [characters.id],
    relationName: 'friend',
  }),
  requestedByChar: one(characters, {
    fields: [friendships.requestedBy],
    references: [characters.id],
  }),
}));

export const playerReportsRelations = relations(playerReports, ({ one }) => ({
  reporter: one(characters, {
    fields: [playerReports.reporterId],
    references: [characters.id],
    relationName: 'reporter',
  }),
  reported: one(characters, {
    fields: [playerReports.reportedId],
    references: [characters.id],
    relationName: 'reported',
  }),
  battleReport: one(battleReports, {
    fields: [playerReports.battleReportId],
    references: [battleReports.id],
  }),
  reviewer: one(users, {
    fields: [playerReports.reviewedBy],
    references: [users.id],
  }),
}));

export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  moderator: one(users, {
    fields: [moderationActions.moderatorId],
    references: [users.id],
  }),
  targetCharacter: one(characters, {
    fields: [moderationActions.targetCharacterId],
    references: [characters.id],
  }),
  targetUser: one(users, {
    fields: [moderationActions.targetUserId],
    references: [users.id],
  }),
  report: one(playerReports, {
    fields: [moderationActions.reportId],
    references: [playerReports.id],
  }),
}));

export const seasonsRelations = relations(seasons, ({ many }) => ({
  rewards: many(seasonRewards),
}));

export const seasonRewardsRelations = relations(seasonRewards, ({ one }) => ({
  season: one(seasons, {
    fields: [seasonRewards.seasonId],
    references: [seasons.id],
  }),
  character: one(characters, {
    fields: [seasonRewards.characterId],
    references: [characters.id],
  }),
}));

export const liveEventsRelations = relations(liveEvents, ({ many }) => ({
  participants: many(liveEventParticipants),
}));

export const liveEventParticipantsRelations = relations(liveEventParticipants, ({ one }) => ({
  event: one(liveEvents, {
    fields: [liveEventParticipants.eventId],
    references: [liveEvents.id],
  }),
  character: one(characters, {
    fields: [liveEventParticipants.characterId],
    references: [characters.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 04 RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const cosmeticItemsRelations = relations(cosmeticItems, ({ one, many }) => ({
  season: one(seasons, {
    fields: [cosmeticItems.seasonId],
    references: [seasons.id],
  }),
  characterCosmetics: many(characterCosmetics),
}));

export const characterCosmeticsRelations = relations(characterCosmetics, ({ one }) => ({
  character: one(characters, {
    fields: [characterCosmetics.characterId],
    references: [characters.id],
  }),
  cosmeticItem: one(cosmeticItems, {
    fields: [characterCosmetics.cosmeticItemId],
    references: [cosmeticItems.id],
  }),
}));

export const referralCodesRelations = relations(referralCodes, ({ one, many }) => ({
  character: one(characters, {
    fields: [referralCodes.characterId],
    references: [characters.id],
  }),
  rewards: many(referralRewards),
}));

export const referralRewardsRelations = relations(referralRewards, ({ one }) => ({
  referrer: one(characters, {
    fields: [referralRewards.referrerId],
    references: [characters.id],
    relationName: 'referrer',
  }),
  referred: one(characters, {
    fields: [referralRewards.referredId],
    references: [characters.id],
    relationName: 'referred',
  }),
  referralCode: one(referralCodes, {
    fields: [referralRewards.referralCodeId],
    references: [referralCodes.id],
  }),
}));

export const seasonPassTiersRelations = relations(seasonPassTiers, ({ one }) => ({
  season: one(seasons, {
    fields: [seasonPassTiers.seasonId],
    references: [seasons.id],
  }),
  freeRewardItem: one(itemTemplates, {
    fields: [seasonPassTiers.freeRewardItemId],
    references: [itemTemplates.id],
    relationName: 'freeReward',
  }),
  premiumRewardItem: one(itemTemplates, {
    fields: [seasonPassTiers.premiumRewardItemId],
    references: [itemTemplates.id],
    relationName: 'premiumReward',
  }),
  premiumRewardCosmetic: one(cosmeticItems, {
    fields: [seasonPassTiers.premiumRewardCosmeticId],
    references: [cosmeticItems.id],
  }),
}));

export const seasonPassProgressRelations = relations(seasonPassProgress, ({ one }) => ({
  season: one(seasons, {
    fields: [seasonPassProgress.seasonId],
    references: [seasons.id],
  }),
  character: one(characters, {
    fields: [seasonPassProgress.characterId],
    references: [characters.id],
  }),
}));

export const gdprRequestsRelations = relations(gdprRequests, ({ one }) => ({
  user: one(users, {
    fields: [gdprRequests.userId],
    references: [users.id],
  }),
  processor: one(users, {
    fields: [gdprRequests.processedBy],
    references: [users.id],
  }),
}));

export const loginStreaksRelations = relations(loginStreaks, ({ one }) => ({
  character: one(characters, {
    fields: [loginStreaks.characterId],
    references: [characters.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 05 RELATIONS — BETA, JOBS, AUDIT, FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

export const betaInvitesRelations = relations(betaInvites, ({ one, many }) => ({
  createdByAdmin: one(users, {
    fields: [betaInvites.createdByAdminId],
    references: [users.id],
  }),
  accessGrants: many(betaAccess),
}));

export const betaAccessRelations = relations(betaAccess, ({ one }) => ({
  user: one(users, {
    fields: [betaAccess.userId],
    references: [users.id],
  }),
  invite: one(betaInvites, {
    fields: [betaAccess.inviteId],
    references: [betaInvites.id],
  }),
}));

export const bugReportsRelations = relations(bugReports, ({ one }) => ({
  user: one(users, {
    fields: [bugReports.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [bugReports.characterId],
    references: [characters.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [feedback.characterId],
    references: [characters.id],
  }),
}));
