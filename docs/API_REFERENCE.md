# API Reference

## Health Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health/liveness` | None | Liveness probe |
| GET | `/api/health/readiness` | None | Readiness probe |
| GET | `/api/health/admin` | Admin | Detailed health |

## Server Actions
All game actions are Next.js Server Actions under `src/app/actions/`.

### Character Actions
- `createCharacter(data)` — Create new character
- `getCharacter()` — Get current character

### Training Actions
- `trainBatch(data)` — Train multiple stat points at once

### Expedition Actions
- `startExpedition(data)` — Begin exploration run

### Arena Actions
- `fightArena()` — PvP battle

### Merchant Actions
- `getMerchant()` — Visit merchant shop

### Quest Actions
- `getQuests()` — Get available quests

### Dungeon Actions
- `startDungeon(data)` — Enter dungeon

### Hideout Actions
- `getHideout()` — View hideout

### Social Actions
- `getConversations()` — List conversations
- `getMessages(data)` — Get conversation messages
- `sendMessage(data)` — Send message
- `getFriendships()` — List friends
- `acceptFriend(data)` — Accept friend request

### Clan Actions
- `createClan(data)` — Create new clan
- `getClans()` — List clans
- `getClanDetails()` — View clan details
- `joinClan(data)` — Join a clan
- `leaveClan()` — Leave current clan

### Season Actions
- `getSeasons()` — List seasons
- `getSeasonDetails(data)` — View season details

### Event Actions
- `getEvents()` — List live events
- `getEventDetails(data)` — View event details

### Payment Actions
- `getCrystalPackages()` — List crystal packages
- `createCheckout(data)` — Start Stripe checkout

### GDPR Actions
- `requestDataExport()` — Request personal data
- `requestAccountDeletion()` — Request account deletion

## Error Responses
All errors follow the structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "requestId": "req_..."
  }
}
```

## Rate Limits
Headers included in responses:
- `X-RateLimit-Limit`: Max requests in window
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp
