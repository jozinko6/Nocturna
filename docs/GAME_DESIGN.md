# Game Design Document

## Overview
Nocturna is a dark fantasy free-to-play PWA browser RPG inspired by classic browser games, featuring turn-based combat, dungeon exploration, PvP arenas, clan warfare, seasonal content, and a cosmetic-only premium store.

## Core Loop
1. **Train** stats (spend gold + energy)
2. **Explore** dungeons ( PvE, earn gold + items)
3. **PvP** in arena (ranked, earn trophies + rewards)
4. **Upgrade** hideout (passive bonuses)
5. **Repeat** daily

## Stats System
| Stat | Effect |
|------|--------|
| Strength | +2.5% melee damage |
| Dexterity | +2.5% ranged damage |
| Stamina | +3% max HP |
| Accuracy | +2% hit chance |
| Dodge | +2% evasion chance |
| Vitality | +5% HP regen per turn |

## Combat
- Turn-based, max 10 rounds
- Server-authoritative with seeded RNG
- Damage = (ATK × multiplier) × (100 / (100 + DEF))
- Critical: `critChance × critDamage`
- Healing: `base × (1 + healingBonus)`

## Economy
- **Gold**: Earned from training, dungeons, PvP, quests
- **Crystals**: Premium currency (purchases only, no earn-to-play)
- Training cost: `baseCost × stat^1.65`
- XP to level: `floor(100 × level^1.45)`

## Factions
| Faction | Buff | Debuff |
|---------|------|--------|
| Sangvari | +5% accuracy, +5% lifesteal | −3% max HP |
| Lunari | +5% max HP, +5% regen | −3% accuracy |

## Monetization
- **Crystal packages**: 100/550/1200/2500/6500
- **Nočný patrón** (4.99€/mo): exclusive cosmetics, +1 expedition slot, daily crystals
- **Cosmetic store**: Outfits, mounts, frames (purely visual)
- **NO pay-to-win**: best gear from gameplay, no paid loot boxes

## Season System
- 3-month seasons with exclusive rewards
- Season pass: free + paid track
- Leaderboards reset each season
- Seasonal modifiers and events

## Live Events
- Rotating events every 2-4 weeks
- Event-specific currencies and shops
- Global community goals
- Leaderboard rewards
