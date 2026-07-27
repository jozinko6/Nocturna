# Push Notifications

## Types
- Expedition complete
- Crafting complete
- Upgrade complete
- Clan war start
- Clan boss available
- Story chapter unlocked
- Auction sale
- Season ending
- Event started
- Daily reward ready

## Permission Model
- Never ask on first visit
- Ask after relevant activity (long expedition, crafting, clan war)
- Show explanation before system prompt
- Easy to disable

## Preferences
Per-type opt-in/opt-out. Default: all transactional on, marketing off.

## Security
- VAPID keys
- Encrypted subscription storage
- No sensitive data in push text
- Rate limiting
- Deduplication

## Technical
- Schema: pushSubscriptions, pushNotificationPreferences, pushDeliveryLogs
- Module: src/game/push.ts
