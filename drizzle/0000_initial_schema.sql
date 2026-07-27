CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"activity_type" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"claimed_at" timestamp with time zone,
	"config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"gold_amount" integer DEFAULT 0 NOT NULL,
	"experience_amount" integer DEFAULT 0 NOT NULL,
	"item_id" uuid,
	"reward_type" text NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_rewards_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auction_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_character_id" uuid NOT NULL,
	"listing_type" text NOT NULL,
	"item_id" uuid,
	"material_template_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_per_unit" integer NOT NULL,
	"total_price" integer NOT NULL,
	"currency" text DEFAULT 'gold' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"sold_at" timestamp with time zone,
	"buyer_character_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auction_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_type" text NOT NULL,
	"template_id" text NOT NULL,
	"average_price" integer NOT NULL,
	"minimum_price" integer NOT NULL,
	"maximum_price" integer NOT NULL,
	"median_price" integer NOT NULL,
	"volume" integer NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auction_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"seller_character_id" uuid NOT NULL,
	"buyer_character_id" uuid NOT NULL,
	"gross_amount" integer NOT NULL,
	"fee_amount" integer NOT NULL,
	"net_amount" integer NOT NULL,
	"item_snapshot" jsonb,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auction_transactions_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_type" text NOT NULL,
	"payload" jsonb,
	"idempotency_key" text NOT NULL,
	"priority" integer DEFAULT 5 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "background_jobs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "battle_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attacker_id" uuid,
	"defender_id" uuid,
	"battle_type" text NOT NULL,
	"seed" integer NOT NULL,
	"rounds" jsonb,
	"result" jsonb,
	"winner_id" uuid,
	"attacker_snapshot" jsonb,
	"defender_snapshot" jsonb,
	"engine_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beta_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"invite_id" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beta_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"created_by_admin_id" uuid NOT NULL,
	"usage_limit" integer DEFAULT 10 NOT NULL,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "beta_invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "bug_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"character_id" uuid,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"steps" text,
	"expected" text,
	"actual" text,
	"screenshot_url" text,
	"release_id" text,
	"route" text,
	"browser_info" text,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_to" text,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_cosmetics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"cosmetic_item_id" uuid NOT NULL,
	"equipped" boolean DEFAULT false NOT NULL,
	"slot" text NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"material_template_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_recipe_unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"recipe_template_id" uuid NOT NULL,
	"unlock_source" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_reputation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"organization_slug" text NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL,
	"tier" text DEFAULT 'neutral' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"current_energy" integer DEFAULT 100 NOT NULL,
	"max_energy" integer DEFAULT 100 NOT NULL,
	"last_energy_update" timestamp with time zone,
	"hit_points" integer DEFAULT 100 NOT NULL,
	"max_hit_points" integer DEFAULT 100 NOT NULL,
	CONSTRAINT "character_resources_character_id_unique" UNIQUE("character_id")
);
--> statement-breakpoint
CREATE TABLE "character_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"strength" integer DEFAULT 5 NOT NULL,
	"dexterity" integer DEFAULT 5 NOT NULL,
	"endurance" integer DEFAULT 5 NOT NULL,
	"perception" integer DEFAULT 5 NOT NULL,
	"willpower" integer DEFAULT 5 NOT NULL,
	"luck" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "character_stats_character_id_unique" UNIQUE("character_id")
);
--> statement-breakpoint
CREATE TABLE "character_story_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"story_decision_id" uuid NOT NULL,
	"selected_option" text NOT NULL,
	"consequence_snapshot" jsonb DEFAULT '{}' NOT NULL,
	"selected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_story_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"current_chapter_id" uuid,
	"current_mission_id" uuid,
	"state" text DEFAULT 'not_started' NOT NULL,
	"completed_missions" jsonb DEFAULT '[]' NOT NULL,
	"decisions" jsonb DEFAULT '[]' NOT NULL,
	"flags" jsonb DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"faction_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"portrait_url" text,
	"title" text,
	"gold" integer DEFAULT 200 NOT NULL,
	"premium_currency" integer DEFAULT 0 NOT NULL,
	"pvp_rating" integer DEFAULT 1000 NOT NULL,
	"pvp_wins" integer DEFAULT 0 NOT NULL,
	"pvp_losses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "characters_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "clan_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clan_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"rank" text DEFAULT 'recruit' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"contribution_gold" integer DEFAULT 0 NOT NULL,
	"contribution_xp" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clan_quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clan_id" uuid NOT NULL,
	"quest_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"target_count" integer NOT NULL,
	"current_count" integer DEFAULT 0 NOT NULL,
	"reward_gold" integer DEFAULT 0 NOT NULL,
	"reward_xp" integer DEFAULT 0 NOT NULL,
	"reward_clan_xp" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clan_ranks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clan_id" uuid NOT NULL,
	"rank_name" text NOT NULL,
	"rank_level" integer NOT NULL,
	"can_invite" boolean DEFAULT false NOT NULL,
	"can_kick" boolean DEFAULT false NOT NULL,
	"can_deposit_treasury" boolean DEFAULT true NOT NULL,
	"can_withdraw_treasury" boolean DEFAULT false NOT NULL,
	"can_start_quest" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clan_treasury" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clan_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clan_war_battles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clan_war_id" uuid NOT NULL,
	"attacker_character_id" uuid NOT NULL,
	"defender_character_id" uuid NOT NULL,
	"battle_report_id" uuid,
	"score_awarded" integer DEFAULT 0 NOT NULL,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clan_war_battles_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "clan_war_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clan_war_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"clan_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"contribution_score" integer DEFAULT 0 NOT NULL,
	"attacks_used" integer DEFAULT 0 NOT NULL,
	"defenses_count" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clan_war_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clan_war_id" uuid NOT NULL,
	"clan_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"reward_payload" jsonb DEFAULT '{}' NOT NULL,
	"contribution_requirement" integer DEFAULT 1 NOT NULL,
	"idempotency_key" text,
	"claimed_at" timestamp with time zone,
	CONSTRAINT "clan_war_rewards_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "clan_wars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attacker_clan_id" uuid NOT NULL,
	"defender_clan_id" uuid NOT NULL,
	"status" text DEFAULT 'proposed' NOT NULL,
	"war_type" text DEFAULT 'standard' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"scoring_config" jsonb DEFAULT '{}' NOT NULL,
	"attacker_score" integer DEFAULT 0 NOT NULL,
	"defender_score" integer DEFAULT 0 NOT NULL,
	"winner_clan_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "clans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"leader_id" uuid NOT NULL,
	"faction_id" uuid,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"gold" integer DEFAULT 0 NOT NULL,
	"max_members" integer DEFAULT 30 NOT NULL,
	"join_policy" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clans_name_unique" UNIQUE("name"),
	CONSTRAINT "clans_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"content_id" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"snapshot" jsonb DEFAULT '{}' NOT NULL,
	"published_by" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"last_read_at" timestamp with time zone,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"clan_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cosmetic_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"price_crystals" integer,
	"membership_only" boolean DEFAULT false NOT NULL,
	"season_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cosmetic_items_item_id_unique" UNIQUE("item_id")
);
--> statement-breakpoint
CREATE TABLE "crafting_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"recipe_template_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"input_snapshot" jsonb DEFAULT '{}' NOT NULL,
	"output_snapshot" jsonb,
	"started_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"claimed_at" timestamp with time zone,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crafting_jobs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "crafting_recipe_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_key" text NOT NULL,
	"description_key" text NOT NULL,
	"output_type" text NOT NULL,
	"output_template_id" text NOT NULL,
	"output_quantity" integer DEFAULT 1 NOT NULL,
	"materials_required" jsonb DEFAULT '[]' NOT NULL,
	"gold_cost" integer DEFAULT 0 NOT NULL,
	"duration_seconds" integer DEFAULT 60 NOT NULL,
	"unlock_conditions" jsonb DEFAULT '{}' NOT NULL,
	"success_rate" integer DEFAULT 100 NOT NULL,
	"failure_config" jsonb,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "crafting_recipe_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "currency_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"currency_type" text NOT NULL,
	"balance_before" integer NOT NULL,
	"change_amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reason" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid,
	"idempotency_key" text NOT NULL,
	"admin_id" uuid,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currency_ledger_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "daily_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"reward_date" date NOT NULL,
	"streak_day" integer DEFAULT 1 NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_rewards_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "economy_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "economy_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "enemies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" integer NOT NULL,
	"base_hp" integer NOT NULL,
	"base_attack" integer NOT NULL,
	"base_defense" integer NOT NULL,
	"base_xp" integer NOT NULL,
	"base_gold" integer NOT NULL,
	"loot_table" jsonb,
	"portrait_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"slot_type" text NOT NULL,
	"item_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expeditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"region_id" uuid NOT NULL,
	"difficulty" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"result" jsonb,
	"battle_report_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faction_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid,
	"faction_id" uuid NOT NULL,
	"goal_type" text NOT NULL,
	"current_score" integer DEFAULT 0 NOT NULL,
	"target_score" integer DEFAULT 1000 NOT NULL,
	"reward_config" jsonb DEFAULT '{}' NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"passive_bonuses" jsonb,
	"icon_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "factions_name_unique" UNIQUE("name"),
	CONSTRAINT "factions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"config" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"character_id" uuid,
	"category" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_response" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"friend_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gdpr_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"request_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_by" uuid,
	"download_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hideout_buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hideout_id" uuid NOT NULL,
	"building_type" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"upgrading" boolean DEFAULT false NOT NULL,
	"upgrade_ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hideouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hideouts_character_id_unique" UNIQUE("character_id")
);
--> statement-breakpoint
CREATE TABLE "item_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"rarity" text NOT NULL,
	"required_level" integer DEFAULT 1 NOT NULL,
	"base_damage" integer DEFAULT 0 NOT NULL,
	"base_defense" integer DEFAULT 0 NOT NULL,
	"stat_bonus" jsonb,
	"secondary_effect" jsonb,
	"faction_restriction" uuid,
	"buy_price" integer NOT NULL,
	"sell_price" integer NOT NULL,
	"icon_url" text,
	"lore_text" text,
	"is_tradeable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "item_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "item_upgrade_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_item_id" uuid NOT NULL,
	"level_before" integer DEFAULT 0 NOT NULL,
	"level_after" integer NOT NULL,
	"success" boolean NOT NULL,
	"cost_snapshot" jsonb DEFAULT '{}' NOT NULL,
	"random_seed" text,
	"config_version" text DEFAULT '1.0.0' NOT NULL,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "item_upgrade_logs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"board_type" text NOT NULL,
	"value" integer NOT NULL,
	"period" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_event_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"reward_claimed" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"event_type" text NOT NULL,
	"config" jsonb,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_ops_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"name_key" text NOT NULL,
	"description_key" text NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"current_streak" integer DEFAULT 1 NOT NULL,
	"longest_streak" integer DEFAULT 1 NOT NULL,
	"last_login_date" text NOT NULL,
	"total_logins" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"material_template_id" uuid NOT NULL,
	"quantity_before" integer NOT NULL,
	"delta" integer NOT NULL,
	"quantity_after" integer NOT NULL,
	"reason" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text,
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "material_ledger_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "material_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_key" text NOT NULL,
	"description_key" text NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"stack_limit" integer DEFAULT 999 NOT NULL,
	"tradable" boolean DEFAULT true NOT NULL,
	"asset_key" text,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "material_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"mission_type" text NOT NULL,
	"target_count" integer NOT NULL,
	"current_count" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"reset_date" date NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "missions_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "moderation_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderator_id" uuid NOT NULL,
	"target_character_id" uuid,
	"target_user_id" uuid,
	"action_type" text NOT NULL,
	"reason" text NOT NULL,
	"duration" integer,
	"duration_unit" text,
	"report_id" uuid,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "patch_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" text NOT NULL,
	"title_key" text NOT NULL,
	"content_key" text NOT NULL,
	"category" text NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patch_notes_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"processed" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "player_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reported_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"battle_report_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"resolution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"analytics_consent" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'sk' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_name" text NOT NULL,
	"crystal_amount" integer NOT NULL,
	"price_eur" integer NOT NULL,
	"stripe_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_type" text NOT NULL,
	"provider_message_id" text,
	"status" text NOT NULL,
	"error_code" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"expedition_complete" boolean DEFAULT true NOT NULL,
	"crafting_complete" boolean DEFAULT true NOT NULL,
	"hideout_complete" boolean DEFAULT true NOT NULL,
	"clan_war" boolean DEFAULT true NOT NULL,
	"clan_boss" boolean DEFAULT true NOT NULL,
	"auction_sale" boolean DEFAULT true NOT NULL,
	"season_event" boolean DEFAULT true NOT NULL,
	"marketing" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint_hash" text NOT NULL,
	"encrypted_subscription_payload" text NOT NULL,
	"user_agent_summary" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pvp_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attacker_id" uuid NOT NULL,
	"defender_id" uuid NOT NULL,
	"status" text NOT NULL,
	"battle_report_id" uuid,
	"league_points_change" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pvp_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"rating" integer DEFAULT 1000 NOT NULL,
	"league" text DEFAULT 'tieň' NOT NULL,
	"season_points" integer DEFAULT 0 NOT NULL,
	"attacks_today" integer DEFAULT 0 NOT NULL,
	"last_attack_at" timestamp with time zone,
	"last_defended_at" timestamp with time zone,
	CONSTRAINT "pvp_ratings_character_id_unique" UNIQUE("character_id")
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"code" text NOT NULL,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"max_uses" integer DEFAULT 10 NOT NULL,
	"reward_per_use" integer DEFAULT 50 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_id" uuid NOT NULL,
	"referral_code_id" uuid NOT NULL,
	"reward_gold" integer DEFAULT 0 NOT NULL,
	"reward_crystals" integer DEFAULT 0 NOT NULL,
	"reward_xp" integer DEFAULT 0 NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"recommended_level" integer NOT NULL,
	"icon_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "regions_name_unique" UNIQUE("name"),
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rewarded_ad_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"ad_provider" text NOT NULL,
	"reward_type" text NOT NULL,
	"reward_amount" integer NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rewarded_ad_claims_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "season_pass_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"current_tier" integer DEFAULT 0 NOT NULL,
	"premium_unlocked" boolean DEFAULT false NOT NULL,
	"claimed_tiers" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season_pass_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"tier" integer NOT NULL,
	"required_xp" integer NOT NULL,
	"free_reward_gold" integer DEFAULT 0 NOT NULL,
	"free_reward_crystals" integer DEFAULT 0 NOT NULL,
	"free_reward_item_id" uuid,
	"premium_reward_gold" integer DEFAULT 0 NOT NULL,
	"premium_reward_crystals" integer DEFAULT 0 NOT NULL,
	"premium_reward_item_id" uuid,
	"premium_reward_cosmetic_id" uuid
);
--> statement-breakpoint
CREATE TABLE "season_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"board_type" text NOT NULL,
	"final_rank" integer NOT NULL,
	"final_value" integer NOT NULL,
	"reward_gold" integer DEFAULT 0 NOT NULL,
	"reward_crystals" integer DEFAULT 0 NOT NULL,
	"reward_title" text,
	"claimed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"season_number" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"reset_pvp_rating" boolean DEFAULT true NOT NULL,
	"reset_pvp_wins" boolean DEFAULT false NOT NULL,
	"reset_leaderboards" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_type" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"details" jsonb,
	"severity" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_key" text NOT NULL,
	"description_key" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"minimum_level" integer DEFAULT 1 NOT NULL,
	"maximum_level" integer DEFAULT 50 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "story_campaigns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "story_chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name_key" text NOT NULL,
	"description_key" text NOT NULL,
	"chapter_order" integer NOT NULL,
	"unlock_conditions" jsonb DEFAULT '{}' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"decision_key" text NOT NULL,
	"option_key" text NOT NULL,
	"consequence_config" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name_key" text NOT NULL,
	"description_key" text NOT NULL,
	"mission_type" text NOT NULL,
	"objective_config" jsonb DEFAULT '{}' NOT NULL,
	"encounter_config" jsonb,
	"reward_config" jsonb DEFAULT '{}' NOT NULL,
	"prerequisite_mission_id" uuid,
	"unlock_conditions" jsonb DEFAULT '{}' NOT NULL,
	"failure_conditions" jsonb,
	"repeatable" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"plan" text NOT NULL,
	"status" text NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text,
	"actor_type" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"details" jsonb,
	"request_id" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "territory_control_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"territory_node_id" uuid NOT NULL,
	"previous_owner_type" text,
	"previous_owner_id" uuid,
	"new_owner_type" text NOT NULL,
	"new_owner_id" uuid,
	"cause_type" text NOT NULL,
	"cause_id" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "territory_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name_key" text NOT NULL,
	"node_type" text NOT NULL,
	"owner_type" text DEFAULT 'none' NOT NULL,
	"owner_clan_id" uuid,
	"owner_faction_id" uuid,
	"status" text DEFAULT 'neutral' NOT NULL,
	"defense_level" integer DEFAULT 0 NOT NULL,
	"scoring_config" jsonb DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "territory_nodes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"role" text DEFAULT 'support' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "world_boss_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_boss_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"total_damage" integer DEFAULT 0 NOT NULL,
	"attempts_used" integer DEFAULT 0 NOT NULL,
	"reward_claimed" boolean DEFAULT false NOT NULL,
	"contributed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_bosses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_key" text NOT NULL,
	"description_key" text NOT NULL,
	"region_id" uuid,
	"max_hp" integer NOT NULL,
	"current_hp" integer NOT NULL,
	"level" integer NOT NULL,
	"mechanics" jsonb DEFAULT '[]' NOT NULL,
	"loot_table" jsonb DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"spawns_at" timestamp with time zone,
	"defeated_at" timestamp with time zone,
	"respawn_at" timestamp with time zone,
	"daily_attempts_per_player" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "world_bosses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "world_regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_key" text NOT NULL,
	"description_key" text NOT NULL,
	"level_min" integer DEFAULT 1 NOT NULL,
	"level_max" integer DEFAULT 50 NOT NULL,
	"map_position" jsonb DEFAULT '{}' NOT NULL,
	"visual_config" jsonb DEFAULT '{}' NOT NULL,
	"resource_config" jsonb DEFAULT '{}' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "world_regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_rewards" ADD CONSTRAINT "activity_rewards_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_rewards" ADD CONSTRAINT "activity_rewards_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_rewards" ADD CONSTRAINT "activity_rewards_item_id_item_templates_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_listings" ADD CONSTRAINT "auction_listings_seller_character_id_characters_id_fk" FOREIGN KEY ("seller_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_listings" ADD CONSTRAINT "auction_listings_item_id_character_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."character_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_listings" ADD CONSTRAINT "auction_listings_material_template_id_material_templates_id_fk" FOREIGN KEY ("material_template_id") REFERENCES "public"."material_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_listings" ADD CONSTRAINT "auction_listings_buyer_character_id_characters_id_fk" FOREIGN KEY ("buyer_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_transactions" ADD CONSTRAINT "auction_transactions_listing_id_auction_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."auction_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_transactions" ADD CONSTRAINT "auction_transactions_seller_character_id_characters_id_fk" FOREIGN KEY ("seller_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_transactions" ADD CONSTRAINT "auction_transactions_buyer_character_id_characters_id_fk" FOREIGN KEY ("buyer_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_reports" ADD CONSTRAINT "battle_reports_attacker_id_characters_id_fk" FOREIGN KEY ("attacker_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_reports" ADD CONSTRAINT "battle_reports_defender_id_characters_id_fk" FOREIGN KEY ("defender_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beta_access" ADD CONSTRAINT "beta_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beta_access" ADD CONSTRAINT "beta_access_invite_id_beta_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."beta_invites"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beta_invites" ADD CONSTRAINT "beta_invites_created_by_admin_id_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_cosmetics" ADD CONSTRAINT "character_cosmetics_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_cosmetics" ADD CONSTRAINT "character_cosmetics_cosmetic_item_id_cosmetic_items_id_fk" FOREIGN KEY ("cosmetic_item_id") REFERENCES "public"."cosmetic_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_items" ADD CONSTRAINT "character_items_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_items" ADD CONSTRAINT "character_items_template_id_item_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."item_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_materials" ADD CONSTRAINT "character_materials_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_materials" ADD CONSTRAINT "character_materials_material_template_id_material_templates_id_fk" FOREIGN KEY ("material_template_id") REFERENCES "public"."material_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_recipe_unlocks" ADD CONSTRAINT "character_recipe_unlocks_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_recipe_unlocks" ADD CONSTRAINT "character_recipe_unlocks_recipe_template_id_crafting_recipe_templates_id_fk" FOREIGN KEY ("recipe_template_id") REFERENCES "public"."crafting_recipe_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_reputation" ADD CONSTRAINT "character_reputation_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_resources" ADD CONSTRAINT "character_resources_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_stats" ADD CONSTRAINT "character_stats_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_story_decisions" ADD CONSTRAINT "character_story_decisions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_story_decisions" ADD CONSTRAINT "character_story_decisions_story_decision_id_story_decisions_id_fk" FOREIGN KEY ("story_decision_id") REFERENCES "public"."story_decisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_story_progress" ADD CONSTRAINT "character_story_progress_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_story_progress" ADD CONSTRAINT "character_story_progress_campaign_id_story_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."story_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_faction_id_factions_id_fk" FOREIGN KEY ("faction_id") REFERENCES "public"."factions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_members" ADD CONSTRAINT "clan_members_clan_id_clans_id_fk" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_members" ADD CONSTRAINT "clan_members_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_quests" ADD CONSTRAINT "clan_quests_clan_id_clans_id_fk" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_ranks" ADD CONSTRAINT "clan_ranks_clan_id_clans_id_fk" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_treasury" ADD CONSTRAINT "clan_treasury_clan_id_clans_id_fk" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_treasury" ADD CONSTRAINT "clan_treasury_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_battles" ADD CONSTRAINT "clan_war_battles_clan_war_id_clan_wars_id_fk" FOREIGN KEY ("clan_war_id") REFERENCES "public"."clan_wars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_battles" ADD CONSTRAINT "clan_war_battles_attacker_character_id_characters_id_fk" FOREIGN KEY ("attacker_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_battles" ADD CONSTRAINT "clan_war_battles_defender_character_id_characters_id_fk" FOREIGN KEY ("defender_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_battles" ADD CONSTRAINT "clan_war_battles_battle_report_id_battle_reports_id_fk" FOREIGN KEY ("battle_report_id") REFERENCES "public"."battle_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_participants" ADD CONSTRAINT "clan_war_participants_clan_war_id_clan_wars_id_fk" FOREIGN KEY ("clan_war_id") REFERENCES "public"."clan_wars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_participants" ADD CONSTRAINT "clan_war_participants_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_participants" ADD CONSTRAINT "clan_war_participants_clan_id_clans_id_fk" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_rewards" ADD CONSTRAINT "clan_war_rewards_clan_war_id_clan_wars_id_fk" FOREIGN KEY ("clan_war_id") REFERENCES "public"."clan_wars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_rewards" ADD CONSTRAINT "clan_war_rewards_clan_id_clans_id_fk" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_war_rewards" ADD CONSTRAINT "clan_war_rewards_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_wars" ADD CONSTRAINT "clan_wars_attacker_clan_id_clans_id_fk" FOREIGN KEY ("attacker_clan_id") REFERENCES "public"."clans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_wars" ADD CONSTRAINT "clan_wars_defender_clan_id_clans_id_fk" FOREIGN KEY ("defender_clan_id") REFERENCES "public"."clans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clan_wars" ADD CONSTRAINT "clan_wars_winner_clan_id_clans_id_fk" FOREIGN KEY ("winner_clan_id") REFERENCES "public"."clans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clans" ADD CONSTRAINT "clans_leader_id_characters_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."characters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clans" ADD CONSTRAINT "clans_faction_id_factions_id_fk" FOREIGN KEY ("faction_id") REFERENCES "public"."factions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_clan_id_clans_id_fk" FOREIGN KEY ("clan_id") REFERENCES "public"."clans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cosmetic_items" ADD CONSTRAINT "cosmetic_items_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crafting_jobs" ADD CONSTRAINT "crafting_jobs_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crafting_jobs" ADD CONSTRAINT "crafting_jobs_recipe_template_id_crafting_recipe_templates_id_fk" FOREIGN KEY ("recipe_template_id") REFERENCES "public"."crafting_recipe_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "currency_ledger" ADD CONSTRAINT "currency_ledger_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "currency_ledger" ADD CONSTRAINT "currency_ledger_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_rewards" ADD CONSTRAINT "daily_rewards_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enemies" ADD CONSTRAINT "enemies_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_slots" ADD CONSTRAINT "equipment_slots_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_slots" ADD CONSTRAINT "equipment_slots_item_id_character_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."character_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expeditions" ADD CONSTRAINT "expeditions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expeditions" ADD CONSTRAINT "expeditions_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faction_goals" ADD CONSTRAINT "faction_goals_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faction_goals" ADD CONSTRAINT "faction_goals_faction_id_factions_id_fk" FOREIGN KEY ("faction_id") REFERENCES "public"."factions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_characters_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requested_by_characters_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."characters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gdpr_requests" ADD CONSTRAINT "gdpr_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gdpr_requests" ADD CONSTRAINT "gdpr_requests_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hideout_buildings" ADD CONSTRAINT "hideout_buildings_hideout_id_hideouts_id_fk" FOREIGN KEY ("hideout_id") REFERENCES "public"."hideouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hideouts" ADD CONSTRAINT "hideouts_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_templates" ADD CONSTRAINT "item_templates_faction_restriction_factions_id_fk" FOREIGN KEY ("faction_restriction") REFERENCES "public"."factions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_upgrade_logs" ADD CONSTRAINT "item_upgrade_logs_character_item_id_character_items_id_fk" FOREIGN KEY ("character_item_id") REFERENCES "public"."character_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_event_participants" ADD CONSTRAINT "live_event_participants_event_id_live_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."live_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_event_participants" ADD CONSTRAINT "live_event_participants_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_streaks" ADD CONSTRAINT "login_streaks_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_ledger" ADD CONSTRAINT "material_ledger_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_ledger" ADD CONSTRAINT "material_ledger_material_template_id_material_templates_id_fk" FOREIGN KEY ("material_template_id") REFERENCES "public"."material_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_characters_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."characters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_target_character_id_characters_id_fk" FOREIGN KEY ("target_character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_report_id_player_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."player_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_reports" ADD CONSTRAINT "player_reports_reporter_id_characters_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."characters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_reports" ADD CONSTRAINT "player_reports_reported_id_characters_id_fk" FOREIGN KEY ("reported_id") REFERENCES "public"."characters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_reports" ADD CONSTRAINT "player_reports_battle_report_id_battle_reports_id_fk" FOREIGN KEY ("battle_report_id") REFERENCES "public"."battle_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_reports" ADD CONSTRAINT "player_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_delivery_logs" ADD CONSTRAINT "push_delivery_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_notification_preferences" ADD CONSTRAINT "push_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD CONSTRAINT "pvp_matches_attacker_id_characters_id_fk" FOREIGN KEY ("attacker_id") REFERENCES "public"."characters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD CONSTRAINT "pvp_matches_defender_id_characters_id_fk" FOREIGN KEY ("defender_id") REFERENCES "public"."characters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD CONSTRAINT "pvp_matches_battle_report_id_battle_reports_id_fk" FOREIGN KEY ("battle_report_id") REFERENCES "public"."battle_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pvp_ratings" ADD CONSTRAINT "pvp_ratings_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referrer_id_characters_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referred_id_characters_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewarded_ad_claims" ADD CONSTRAINT "rewarded_ad_claims_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_pass_progress" ADD CONSTRAINT "season_pass_progress_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_pass_progress" ADD CONSTRAINT "season_pass_progress_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_pass_tiers" ADD CONSTRAINT "season_pass_tiers_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_pass_tiers" ADD CONSTRAINT "season_pass_tiers_free_reward_item_id_item_templates_id_fk" FOREIGN KEY ("free_reward_item_id") REFERENCES "public"."item_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_pass_tiers" ADD CONSTRAINT "season_pass_tiers_premium_reward_item_id_item_templates_id_fk" FOREIGN KEY ("premium_reward_item_id") REFERENCES "public"."item_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_pass_tiers" ADD CONSTRAINT "season_pass_tiers_premium_reward_cosmetic_id_cosmetic_items_id_fk" FOREIGN KEY ("premium_reward_cosmetic_id") REFERENCES "public"."cosmetic_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_rewards" ADD CONSTRAINT "season_rewards_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_rewards" ADD CONSTRAINT "season_rewards_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_chapters" ADD CONSTRAINT "story_chapters_campaign_id_story_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."story_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_decisions" ADD CONSTRAINT "story_decisions_mission_id_story_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."story_missions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_missions" ADD CONSTRAINT "story_missions_chapter_id_story_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."story_chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "territory_control_history" ADD CONSTRAINT "territory_control_history_territory_node_id_territory_nodes_id_fk" FOREIGN KEY ("territory_node_id") REFERENCES "public"."territory_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "territory_nodes" ADD CONSTRAINT "territory_nodes_region_id_world_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."world_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "territory_nodes" ADD CONSTRAINT "territory_nodes_owner_clan_id_clans_id_fk" FOREIGN KEY ("owner_clan_id") REFERENCES "public"."clans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "territory_nodes" ADD CONSTRAINT "territory_nodes_owner_faction_id_factions_id_fk" FOREIGN KEY ("owner_faction_id") REFERENCES "public"."factions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_boss_contributions" ADD CONSTRAINT "world_boss_contributions_world_boss_id_world_bosses_id_fk" FOREIGN KEY ("world_boss_id") REFERENCES "public"."world_bosses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_boss_contributions" ADD CONSTRAINT "world_boss_contributions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_bosses" ADD CONSTRAINT "world_bosses_region_id_world_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."world_regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_character_id_idx" ON "activities" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "activities_status_idx" ON "activities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "activities_ends_at_idx" ON "activities" USING btree ("ends_at");--> statement-breakpoint
CREATE INDEX "activity_rewards_character_id_idx" ON "activity_rewards" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "activity_rewards_activity_id_idx" ON "activity_rewards" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_admin_id_idx" ON "admin_audit_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_target_type_target_id_idx" ON "admin_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auction_listings_seller_idx" ON "auction_listings" USING btree ("seller_character_id");--> statement-breakpoint
CREATE INDEX "auction_listings_status_idx" ON "auction_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "auction_listings_ends_at_idx" ON "auction_listings" USING btree ("ends_at");--> statement-breakpoint
CREATE INDEX "auction_price_history_template_idx" ON "auction_price_history" USING btree ("template_type","template_id");--> statement-breakpoint
CREATE INDEX "auction_transactions_listing_idx" ON "auction_transactions" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "auction_transactions_seller_idx" ON "auction_transactions" USING btree ("seller_character_id");--> statement-breakpoint
CREATE INDEX "auction_transactions_buyer_idx" ON "auction_transactions" USING btree ("buyer_character_id");--> statement-breakpoint
CREATE INDEX "background_jobs_status_idx" ON "background_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "background_jobs_priority_scheduled_at_idx" ON "background_jobs" USING btree ("priority","scheduled_at");--> statement-breakpoint
CREATE INDEX "background_jobs_job_type_idx" ON "background_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "battle_reports_attacker_id_idx" ON "battle_reports" USING btree ("attacker_id");--> statement-breakpoint
CREATE INDEX "battle_reports_defender_id_idx" ON "battle_reports" USING btree ("defender_id");--> statement-breakpoint
CREATE INDEX "battle_reports_battle_type_idx" ON "battle_reports" USING btree ("battle_type");--> statement-breakpoint
CREATE INDEX "beta_access_user_id_idx" ON "beta_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "beta_access_invite_id_idx" ON "beta_access" USING btree ("invite_id");--> statement-breakpoint
CREATE INDEX "beta_access_status_idx" ON "beta_access" USING btree ("status");--> statement-breakpoint
CREATE INDEX "beta_invites_created_by_admin_id_idx" ON "beta_invites" USING btree ("created_by_admin_id");--> statement-breakpoint
CREATE INDEX "beta_invites_status_idx" ON "beta_invites" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bug_reports_user_id_idx" ON "bug_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bug_reports_character_id_idx" ON "bug_reports" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "bug_reports_category_idx" ON "bug_reports" USING btree ("category");--> statement-breakpoint
CREATE INDEX "bug_reports_status_idx" ON "bug_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "character_cosmetics_character_id_idx" ON "character_cosmetics" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "character_cosmetics_equipped_idx" ON "character_cosmetics" USING btree ("equipped");--> statement-breakpoint
CREATE UNIQUE INDEX "char_cosmetics_char_item_unique" ON "character_cosmetics" USING btree ("character_id","cosmetic_item_id");--> statement-breakpoint
CREATE INDEX "character_items_character_id_idx" ON "character_items" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "character_items_template_id_idx" ON "character_items" USING btree ("template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "char_material_char_mat_idx" ON "character_materials" USING btree ("character_id","material_template_id");--> statement-breakpoint
CREATE INDEX "characterMaterials_character_id_idx" ON "character_materials" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "char_recipe_unlock_char_recipe_idx" ON "character_recipe_unlocks" USING btree ("character_id","recipe_template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "char_reputation_char_org_idx" ON "character_reputation" USING btree ("character_id","organization_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "char_story_decision_char_decision_idx" ON "character_story_decisions" USING btree ("character_id","story_decision_id");--> statement-breakpoint
CREATE INDEX "character_story_decisions_character_id_idx" ON "character_story_decisions" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "character_story_progress_char_camp_idx" ON "character_story_progress" USING btree ("character_id","campaign_id");--> statement-breakpoint
CREATE INDEX "character_story_progress_character_id_idx" ON "character_story_progress" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "characters_user_id_idx" ON "characters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "characters_faction_id_idx" ON "characters" USING btree ("faction_id");--> statement-breakpoint
CREATE INDEX "characters_level_idx" ON "characters" USING btree ("level");--> statement-breakpoint
CREATE INDEX "characters_pvp_rating_idx" ON "characters" USING btree ("pvp_rating");--> statement-breakpoint
CREATE INDEX "clan_members_clan_id_idx" ON "clan_members" USING btree ("clan_id");--> statement-breakpoint
CREATE INDEX "clan_members_character_id_idx" ON "clan_members" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clan_members_clan_character_unique" ON "clan_members" USING btree ("clan_id","character_id");--> statement-breakpoint
CREATE INDEX "clan_quests_clan_id_idx" ON "clan_quests" USING btree ("clan_id");--> statement-breakpoint
CREATE INDEX "clan_quests_status_idx" ON "clan_quests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "clan_ranks_clan_id_idx" ON "clan_ranks" USING btree ("clan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "clan_ranks_clan_name_unique" ON "clan_ranks" USING btree ("clan_id","rank_name");--> statement-breakpoint
CREATE INDEX "clan_treasury_clan_id_idx" ON "clan_treasury" USING btree ("clan_id");--> statement-breakpoint
CREATE INDEX "clan_treasury_character_id_idx" ON "clan_treasury" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "clan_war_battles_war_idx" ON "clan_war_battles" USING btree ("clan_war_id");--> statement-breakpoint
CREATE INDEX "clan_war_participants_war_idx" ON "clan_war_participants" USING btree ("clan_war_id");--> statement-breakpoint
CREATE INDEX "clan_war_participants_character_idx" ON "clan_war_participants" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "clan_war_rewards_war_idx" ON "clan_war_rewards" USING btree ("clan_war_id");--> statement-breakpoint
CREATE INDEX "clan_war_rewards_character_idx" ON "clan_war_rewards" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "clan_wars_attacker_idx" ON "clan_wars" USING btree ("attacker_clan_id");--> statement-breakpoint
CREATE INDEX "clan_wars_defender_idx" ON "clan_wars" USING btree ("defender_clan_id");--> statement-breakpoint
CREATE INDEX "clan_wars_status_idx" ON "clan_wars" USING btree ("status");--> statement-breakpoint
CREATE INDEX "clans_leader_id_idx" ON "clans" USING btree ("leader_id");--> statement-breakpoint
CREATE INDEX "clans_faction_id_idx" ON "clans" USING btree ("faction_id");--> statement-breakpoint
CREATE INDEX "clans_level_idx" ON "clans" USING btree ("level");--> statement-breakpoint
CREATE INDEX "content_versions_type_id_idx" ON "content_versions" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "conversation_participants_conversation_id_idx" ON "conversation_participants" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversation_participants_character_id_idx" ON "conversation_participants" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conv_participants_conv_character_unique" ON "conversation_participants" USING btree ("conversation_id","character_id");--> statement-breakpoint
CREATE INDEX "conversations_type_idx" ON "conversations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "conversations_clan_id_idx" ON "conversations" USING btree ("clan_id");--> statement-breakpoint
CREATE INDEX "cosmetic_items_category_idx" ON "cosmetic_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cosmetic_items_rarity_idx" ON "cosmetic_items" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX "crafting_jobs_character_id_idx" ON "crafting_jobs" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "crafting_jobs_status_idx" ON "crafting_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "currency_ledger_character_id_idx" ON "currency_ledger" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "currency_ledger_source_type_source_id_idx" ON "currency_ledger" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "currency_ledger_admin_id_idx" ON "currency_ledger" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "daily_rewards_character_id_idx" ON "daily_rewards" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "daily_rewards_reward_date_idx" ON "daily_rewards" USING btree ("reward_date");--> statement-breakpoint
CREATE INDEX "enemies_region_id_idx" ON "enemies" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "enemies_level_idx" ON "enemies" USING btree ("level");--> statement-breakpoint
CREATE INDEX "equipment_slots_character_id_idx" ON "equipment_slots" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "equipment_slots_character_slot_unique" ON "equipment_slots" USING btree ("character_id","slot_type");--> statement-breakpoint
CREATE INDEX "expeditions_character_id_idx" ON "expeditions" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "expeditions_region_id_idx" ON "expeditions" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "expeditions_status_idx" ON "expeditions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "faction_goals_season_idx" ON "faction_goals" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "faction_goals_faction_idx" ON "faction_goals" USING btree ("faction_id");--> statement-breakpoint
CREATE INDEX "feedback_user_id_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feedback_character_id_idx" ON "feedback" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "feedback_category_idx" ON "feedback" USING btree ("category");--> statement-breakpoint
CREATE INDEX "feedback_priority_idx" ON "feedback" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "feedback_status_idx" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "friendships_character_id_idx" ON "friendships" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "friendships_friend_id_idx" ON "friendships" USING btree ("friend_id");--> statement-breakpoint
CREATE INDEX "friendships_status_idx" ON "friendships" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "friendships_pair_unique" ON "friendships" USING btree ("character_id","friend_id");--> statement-breakpoint
CREATE INDEX "gdpr_requests_user_id_idx" ON "gdpr_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gdpr_requests_status_idx" ON "gdpr_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gdpr_requests_request_type_idx" ON "gdpr_requests" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "hideout_buildings_hideout_id_idx" ON "hideout_buildings" USING btree ("hideout_id");--> statement-breakpoint
CREATE INDEX "item_templates_type_idx" ON "item_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "item_templates_rarity_idx" ON "item_templates" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX "item_templates_required_level_idx" ON "item_templates" USING btree ("required_level");--> statement-breakpoint
CREATE INDEX "item_upgrade_logs_character_item_id_idx" ON "item_upgrade_logs" USING btree ("character_item_id");--> statement-breakpoint
CREATE INDEX "leaderboards_character_id_idx" ON "leaderboards" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "leaderboards_board_type_value_idx" ON "leaderboards" USING btree ("board_type","value");--> statement-breakpoint
CREATE INDEX "leaderboards_period_idx" ON "leaderboards" USING btree ("period");--> statement-breakpoint
CREATE INDEX "live_event_participants_event_id_idx" ON "live_event_participants" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "live_event_participants_character_id_idx" ON "live_event_participants" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "live_event_part_char_unique" ON "live_event_participants" USING btree ("event_id","character_id");--> statement-breakpoint
CREATE INDEX "live_events_status_idx" ON "live_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_events_starts_at_idx" ON "live_events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "live_events_ends_at_idx" ON "live_events" USING btree ("ends_at");--> statement-breakpoint
CREATE INDEX "live_ops_events_status_idx" ON "live_ops_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_ops_events_starts_at_idx" ON "live_ops_events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "login_streaks_character_id_idx" ON "login_streaks" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "login_streaks_character_unique" ON "login_streaks" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "material_ledger_character_id_idx" ON "material_ledger" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "material_ledger_material_template_id_idx" ON "material_ledger" USING btree ("material_template_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_sender_id_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "missions_character_id_idx" ON "missions" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "missions_reset_date_idx" ON "missions" USING btree ("reset_date");--> statement-breakpoint
CREATE INDEX "moderation_actions_moderator_id_idx" ON "moderation_actions" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "moderation_actions_target_character_id_idx" ON "moderation_actions" USING btree ("target_character_id");--> statement-breakpoint
CREATE INDEX "moderation_actions_target_user_id_idx" ON "moderation_actions" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "moderation_actions_action_type_idx" ON "moderation_actions" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "moderation_actions_expires_at_idx" ON "moderation_actions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "notifications_character_id_idx" ON "notifications" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "outbox_events_status_idx" ON "outbox_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "outbox_events_aggregate_type_aggregate_id_idx" ON "outbox_events" USING btree ("aggregate_type","aggregate_id");--> statement-breakpoint
CREATE INDEX "outbox_events_event_type_idx" ON "outbox_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "payment_events_processed_idx" ON "payment_events" USING btree ("processed");--> statement-breakpoint
CREATE INDEX "payment_events_event_type_idx" ON "payment_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "player_reports_reporter_id_idx" ON "player_reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "player_reports_reported_id_idx" ON "player_reports" USING btree ("reported_id");--> statement-breakpoint
CREATE INDEX "player_reports_status_idx" ON "player_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "purchases_user_id_idx" ON "purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "purchases_stripe_session_id_idx" ON "purchases" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "purchases_status_idx" ON "purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "push_delivery_logs_user_idx" ON "push_delivery_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_delivery_logs_type_idx" ON "push_delivery_logs" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_status_idx" ON "push_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pvp_matches_attacker_id_idx" ON "pvp_matches" USING btree ("attacker_id");--> statement-breakpoint
CREATE INDEX "pvp_matches_defender_id_idx" ON "pvp_matches" USING btree ("defender_id");--> statement-breakpoint
CREATE INDEX "pvp_matches_status_idx" ON "pvp_matches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pvp_ratings_rating_idx" ON "pvp_ratings" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "pvp_ratings_league_idx" ON "pvp_ratings" USING btree ("league");--> statement-breakpoint
CREATE INDEX "referral_codes_character_id_idx" ON "referral_codes" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "referral_codes_code_idx" ON "referral_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "referral_rewards_referrer_id_idx" ON "referral_rewards" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "referral_rewards_referred_id_idx" ON "referral_rewards" USING btree ("referred_id");--> statement-breakpoint
CREATE UNIQUE INDEX "referral_rewards_referrer_referred_unique" ON "referral_rewards" USING btree ("referrer_id","referred_id");--> statement-breakpoint
CREATE INDEX "rewarded_ad_claims_character_id_idx" ON "rewarded_ad_claims" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "season_pass_progress_season_id_idx" ON "season_pass_progress" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "season_pass_progress_character_id_idx" ON "season_pass_progress" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "season_pass_progress_season_char_unique" ON "season_pass_progress" USING btree ("season_id","character_id");--> statement-breakpoint
CREATE INDEX "season_pass_tiers_season_id_idx" ON "season_pass_tiers" USING btree ("season_id");--> statement-breakpoint
CREATE UNIQUE INDEX "season_pass_tiers_season_tier_unique" ON "season_pass_tiers" USING btree ("season_id","tier");--> statement-breakpoint
CREATE INDEX "season_rewards_season_id_idx" ON "season_rewards" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "season_rewards_character_id_idx" ON "season_rewards" USING btree ("character_id");--> statement-breakpoint
CREATE UNIQUE INDEX "season_rewards_season_char_board_unique" ON "season_rewards" USING btree ("season_id","character_id","board_type");--> statement-breakpoint
CREATE INDEX "seasons_status_idx" ON "seasons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seasons_season_number_idx" ON "seasons" USING btree ("season_number");--> statement-breakpoint
CREATE INDEX "security_events_user_id_idx" ON "security_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "security_events_event_type_idx" ON "security_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "security_events_severity_idx" ON "security_events" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "security_events_created_at_idx" ON "security_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "story_chapters_campaign_id_idx" ON "story_chapters" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "story_decisions_mission_id_idx" ON "story_decisions" USING btree ("mission_id");--> statement-breakpoint
CREATE INDEX "story_missions_chapter_id_idx" ON "story_missions" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "system_audit_logs_actor_type_idx" ON "system_audit_logs" USING btree ("actor_type");--> statement-breakpoint
CREATE INDEX "system_audit_logs_action_idx" ON "system_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "system_audit_logs_target_type_target_id_idx" ON "system_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "system_audit_logs_created_at_idx" ON "system_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "territory_control_history_node_idx" ON "territory_control_history" USING btree ("territory_node_id");--> statement-breakpoint
CREATE INDEX "territory_nodes_region_idx" ON "territory_nodes" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "territory_nodes_owner_clan_idx" ON "territory_nodes" USING btree ("owner_clan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "world_boss_contrib_boss_char_idx" ON "world_boss_contributions" USING btree ("world_boss_id","character_id");--> statement-breakpoint
CREATE INDEX "worldBossContributions_character_id_idx" ON "world_boss_contributions" USING btree ("character_id");--> statement-breakpoint
CREATE INDEX "world_bosses_status_idx" ON "world_bosses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "world_bosses_region_idx" ON "world_bosses" USING btree ("region_id");