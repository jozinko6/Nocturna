# Crafting System

## Overview
Players gather materials from combat, exploration, and dismantling, then use recipes to craft equipment and consumables.

## Materials
8 categories: metal, leather, wood, essence, rune, relic_fragment, boss_material, event_material.
24 material templates with rarity levels from common to legendary.

## Recipes
8 base recipes for weapons, armor, consumables, and upgrade materials.
All crafting is deterministic (100% success rate) for standard recipes.

## Crafting Flow
1. Learn recipe (via story, reputation, or discovery)
2. Gather materials
3. Start crafting job (pay gold + materials)
4. Wait for duration
5. Claim result

## Upgrade System
- +1 to +5: guaranteed success
- +6 to +8: 80% success, no item loss
- +9 to +10: 50% success, requires special materials

## Dismantling
Break down items for materials. Yield based on rarity, level, and upgrade level.
Confirmation required for rare+ items.

## Economy Protection
- Material ledger tracks all changes
- Dismantle yield < purchase price
- Crafting cost > material value
- Automated audit: `npm run audit:crafting-economy`
