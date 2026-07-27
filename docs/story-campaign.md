# Story Campaign — Kronika zatmenia

## Overview
The main story campaign follows the player through 5 chapters + prologue, with 25+ missions, 4 regional bosses, and 6 significant decisions.

## Campaign Structure
- **Prolog**: Stopy v daždi (3 missions)
- **Kapitola 1**: Mesto bez svitania (5 missions, 1 boss)
- **Kapitola 2**: Čierny les (5 missions, 1 boss)
- **Kapitola 3**: Krypty Prvých (5 missions, 1 boss)
- **Kapitola 4**: Mesačné vrchy (4 missions, 1 boss)
- **Kapitola 5**: Koruna zatmenia (3 missions, alternate endings)

## Decision System
Decisions affect reputation, unlock recipes, and influence the story ending. They never provide dominant PvP bonuses.

## Boss Mechanics
Each boss has unique mechanics: poison, regeneration, skill copying, or phased combat.

## Reputation
5 organizations with 7 reputation tiers (hostile → exalted). Reputation unlocks cosmetics, recipes, and side quests.

## Technical
- Schema: `character_story_progress`, `character_story_decisions`, `characterReputation`
- Module: `src/game/story.ts`
- Config: `src/lib/config/story.ts`
