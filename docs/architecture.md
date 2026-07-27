# Architektúra — Nocturna

## 1. Prehľad

Nocturna je **modulárny monolit** postavený na Next.js App Router s server-authoritative architektúrou. Všetky herné výpočty prebiehajú na serveri, klient je zodpovedný len za UI renderovanie.

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                         │
│  React + Tailwind CSS (Next.js App Router)       │
│  Server Components + minimal Client Components   │
└──────────────────────┬──────────────────────────┘
                       │ Server Actions / API Routes
┌──────────────────────▼──────────────────────────┐
│                   SERVER                         │
│  Next.js App Router (Server Actions)             │
│  ┌─────────────────────────────────────────┐     │
│  │            MODULES                       │     │
│  │  auth | character | combat | economy    │     │
│  │  pve  | pvp      | items  | activities │     │
│  │  hideout | shop   | quests | payments  │     │
│  │  admin | analytics | notifications     │     │
│  └─────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────┐     │
│  │         DATA LAYER                       │     │
│  │  Drizzle ORM → PostgreSQL (Supabase)    │     │
│  │  Redis (Upstash) — cooldowns, cache     │     │
│  └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

| Vrstva | Technológia | Dôvod |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Full-stack, SSR, Server Actions, file-based routing |
| **Jazyk** | TypeScript (strict mode) | Type safety, autocompletion, refactor safety |
| **UI** | React 18+ | Server Components, Suspense, streaming |
| **Styling** | Tailwind CSS | Utility-first, responsive, dark theme |
| **Databáza** | PostgreSQL (Supabase) | Robustná, SQL, row-level security |
| **ORM** | Drizzle ORM | Type-safe, lightweight, SQL-like API |
| **Auth** | Supabase Auth | Email/password, JWT, session management |
| **Cache/Cooldowns** | Redis (Upstash) | Rýchle TTL operácie, serverless-friendly |
| **Platby** | Stripe | Platba kartou, subscriptions, webhooks |
| **Analytics** | PostHog | Product analytics, feature flags |
| **Error tracking** | Sentry | Error monitoring, performance tracking |
| **Email** | Resend | Transakčné emaily (verifikácia, notifikácie) |

---

## 3. Architektonické vzory

### 3.1 Server-Authoritative

Všetky herné výpočty prebiehajú na serveri:
- Combat výpočty (damage, hit/miss, critical)
- Ekonomické transakcie (gold, premium currency)
- Energy regenerácia (calcul based on server time)
- Reward generovanie
- Rating výpočty

**Princíp:** Klient nikdy neverí. Čas, balance, inventory — všetko je overované na serveri.

### 3.2 Modular Monolith

Aplikácia je rozdelená do **modulov**, nie microservisov. Každý modul má:
- Vlastný addressable namespace
- Definované API (server actions)
- Vlastné typy
- Minimálne závislosti na iných moduloch

### 3.3 Server Components (default)

- Väčšina stránok je **React Server Components** (žiadny client JS)
- `use client` len pre interaktívne komponenty (formuláre, modaly, real-time updates)
- Data fetching priamo v server komponentoch

---

## 4. Moduly

### 4.1 Auth modul

```
lib/auth/
├── server.ts          # Server-side auth helpers
├── client.ts          # Client-side auth helpers
├── middleware.ts       # Auth middleware
├── actions.ts         # Login, register, logout server actions
└── types.ts           # Auth types
```

**Zodpovednosti:**
- Registrácia (email + password)
- Prihlásenie / odhlásenie
- Email verifikácia
- Session management (JWT cookies)
- Password reset
- Rate limiting na auth endpointoch
- Turnstile CAPTCHA

**Závislosti:** Supabase Auth, Resend (email), Redis (rate limiting)

### 4.2 Character modul

```
lib/character/
├── server.ts          # Character CRUD
├── attributes.ts      # Attribute training logic
├── progression.ts     # XP, level-up logic
├── stats.ts           # Derived stats calculation
├── actions.ts         # Server actions
└── types.ts           # Character types
```

**Zodpovednosti:**
- Vytvorenie postavy
- Čítanie/upravovanie postavy
- Tréning atribútov (s gold cost a energy cost)
- Levelovanie (XP → level)
- Derived stats výpočet
- Equipment management

**Závislosti:** Economy modul (gold), Items modul (equipment)

### 4.3 Combat modul

```
lib/combat/
├── engine.ts          # Bojový engine (max 10 kôl)
├── formulas.ts        # Všetky combat výpočty
├── rng.ts             # Seeded RNG
├── types.ts           # Combat types
└── reports.ts         # Battle report generation
```

**Zodpovednosti:**
- Ťažobný bojový engine (max 10 kôl)
- Výpočet: attack, hit/miss, critical, dodge, block
- Damage formula
- Status effects (MVP: len základné)
- Battle reports (uložené pre review)
- Seeded RNG pre reprodukovateľnosť

**Závislosti:** Character modul (stats), Items modul (equipment bonuses)

### 4.4 Economy modul

```
lib/economy/
├── gold.ts            # Gold operations
├── crystals.ts        # Premium currency operations
├── ledger.ts          # Economic ledger (audit trail)
├── pricing.ts         # Dynamic pricing
├── inflation.ts       # Anti-inflation measures
├── actions.ts         # Server actions
└── types.ts           # Economy types
```

**Zodpovednosti:**
- Gold pridelenie / odobratie
- Nočné kryštály pridelenie / odobratie
- Economic ledger (každá transakcia je logovaná)
- Merchant pricing
- Anti-inflation (gold sinks)
- Idempotent transakcie

**Závislosti:** Žiadne (základný modul)

### 4.5 PvE modul

```
lib/pve/
├── regions.ts         # Region definitions
├── encounters.ts      # Encounter generation
├── expeditions.ts     # Expedition logic
├── enemies.ts         # Enemy definitions
├── loot.ts            # Loot table logic
├── actions.ts         # Server actions
└── types.ts           # PvE types
```

**Zodpovednosti:**
- Generovanie encounterov podľa regiónu a levelu
- Výpravy (start, progress, complete)
- Loot generovanie
- XP a gold odmeny
- Energy spotreba
- Frakčné bonusy

**Závislosti:** Combat modul (boj), Character modul (stats, level), Economy modul (gold), Items modul (loot)

### 4.6 PvP modul

```
lib/pvp/
├── arena.ts           # Arena logic
├── matchmaking.ts     # ELO-based matchmaking
├── rating.ts          # ELO rating calculations
├── leaderboard.ts     # Leaderboard generation
├── actions.ts         # Server actions
└── types.ts           # PvP types
```

**Zodpovednosti:**
- ELO rating systém
- Matchmaking (podľa ratingu)
- PvP súboje (1v1)
- Týždenné leaderboard reset
- Frakčné leaderboardy
- Denný limit súbojov

**Závislosti:** Combat modul (boj), Character modul (stats), Economy modul (odmeny)

### 4.7 Items modul

```
lib/items/
├── templates.ts       # Item template definitions
├── inventory.ts       # Inventory management
├── equipment.ts       # Equipment slot management
├── loot.ts            # Loot generation
├── actions.ts         # Server actions
└── types.ts           # Item types
```

**Zodpovednosti:**
- Item templates (štatistiky, rarity, slot)
- Inventory management (pridanie, odobranie, preset)
- Equipment (equipping, unequipping, stat bonuses)
- Loot generovanie podľa rarity tables

**Závislosti:** Character modul (postava), Economy modul (ceny)

### 4.8 Activities modul

```
lib/activities/
├── training.ts        # Training activities
├── timed.ts           # Timed activities
├── cooldowns.ts       # Cooldown management (Redis)
├── actions.ts         # Server actions
└── types.ts           # Activity types
```

**Zodpovednosti:**
- Časovo obmedzené aktivity
- Tréning (s cooldownom)
- Cooldown sledovanie (Redis TTL)
- Denný reset aktivít

**Závislosti:** Character modul, Economy modul, Redis

### 4.9 Hideout modul

```
lib/hideout/
├── buildings.ts       # Building definitions
├── upgrades.ts        # Upgrade logic
├── production.ts      # Passive production
├── actions.ts         # Server actions
└── types.ts           # Hideout types
```

**Zodpovednosti:**
- Budovy a ich funkcie
- Upgrade systém (level, cost, time)
- Pasívna produkcia (energia, gold)
- Frakčné špecifické budovy

**Závislosti:** Character modul, Economy modul

### 4.10 Shop modul

```
lib/shop/
├── merchant.ts        # Merchant rotation
├── crystalShop.ts     # Premium shop
├── pricing.ts         # Price calculations
├── actions.ts         # Server actions
└── types.ts           # Shop types
```

**Zodpovednosti:**
- Rotujúci obchod (gold + premium sloty)
- Nočné kryštály shop
- Denná rotácia
- Nákup a overenie (gold/krystal balance check)

**Závislosti:** Economy modul, Items modul

### 4.11 Quests modul

```
lib/quests/
├── daily.ts           # Daily quest generation
├── progress.ts        # Quest progress tracking
├── rewards.ts         # Quest reward calculation
├── actions.ts         # Server actions
└── types.ts           # Quest types
```

**Zodpovednosti:**
- Generovanie denných úloh
- Sledovanie progresu
- Odmeny za dokončenie
- Bonus za kompletné plnenie

**Závislosti:** Character modul, Economy modul, PvE modul, PvP modul

### 4.12 Payments modul

```
lib/payments/
├── stripe.ts          # Stripe integration
├── webhooks.ts        # Webhook handlers
├── crystals.ts        # Crystal purchase logic
├── membership.ts      # Nočný patrón membership
├── actions.ts         # Server actions
└── types.ts           # Payment types
```

**Zodpovednosti:**
- Stripe checkout session
- Webhook spracovanie (payment_intent.succeeded, etc.)
- Crystal purchase (idempotent)
- Membership management
- Fraud heuristics

**Závislosti:** Economy modul, Auth modul

### 4.13 Admin modul

```
lib/admin/
├── roles.ts           # RBAC (support, moderator, economy_manager, administrator)
├── playerMgmt.ts      # Player management
├── economy.ts         # Economy ledger review
├── config.ts          # Game config management
├── audit.ts           # Admin audit logging
├── actions.ts         # Server actions
└── types.ts           # Admin types
```

**Zodpovednosti:**
- Admin role a oprávnenia
- Player management (vyhľadávanie, ban, compensation)
- Economy review (ledger, transakcie)
- Game config úpravy
- Admin audit log
- Feature flags

**Závislosti:** Všetky moduly (read-only access + admin actions)

### 4.14 Analytics modul

```
lib/analytics/
├── posthog.ts         # PostHog integration
├── events.ts          # Event definitions
├── metrics.ts         # Custom metrics
└── types.ts           # Analytics types
```

**Zodpovednosti:**
- Trackovanie herných eventov
- Custom metrics (retention, session length, conversion)
- Feature flag evaluation
- A/B testing support

**Závislosti:** PostHog SDK

### 4.15 Notifications modul

```
lib/notifications/
├── inApp.ts           # In-app notifikácie
├── email.ts           # Email notifikácie (Resend)
├── templates.ts       # Email šablóny
├── actions.ts         # Server actions
└── types.ts           # Notification types
```

**Zodpovednosti:**
- In-app notifikácie (denné odmeny, PvP výsledky)
- Email notifikácie (verifikácia, password reset, membership)
- Notifikačné preferencie

**Závislosti:** Auth modul, Resend

---

## 5. Databázová architektúra

### 5.1 PostgreSQL (Supabase)

- Primárne úložisko pre všetky herné dáta
- Row Level Security (RLS) pre auth
- Drizzle ORM pre type-safe queries
- Migrácie cez Drizzle Kit

### 5.2 Redis (Upstash)

- **Cooldown tracking** (TTL-based, nie cron)
- **Rate limiting** (sliding window)
- **Session cache** (JWT verification cache)
- **Leaderboard cache** (sorted sets)

---

## 6. Deployment

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │────►│   Supabase   │────►│   Upstash    │
│   (Next.js)  │     │   (Postgres) │     │   (Redis)    │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       ├────► Stripe (platby)
       ├────► PostHog (analytics)
       ├────► Sentry (errors)
       └────► Resend (email)
```

---

## 7. Bezpečnosť (high-level)

| Opatrenie | Implementácia |
|---|---|
| Server-authoritative | Všetky herné výpočty na serveri |
| Input validation | Zod + Drizzle pre všetky vstupy |
| Rate limiting | Redis sliding window |
| CSRF protection | Next.js server actions + CSRF tokens |
| SQL injection | Drizzle ORM (parameterized queries) |
| XSS prevention | React escaping + CSP headers |
| Auth | Supabase Auth + JWT cookies |
| Audit logging | Admin akcie logované v DB |
| No client trust | Čas, balance, inventory — všetko server-side |

---

## 8. Štruktúra projektu

```
nocturna/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth stránky (login, register)
│   ├── (game)/             # Hlavné herné stránky
│   │   ├── character/      # Profil postavy
│   │   ├── expedition/     # Výpravy
│   │   ├── arena/          # PvP arena
│   │   ├── hideout/        # Úkryt
│   │   ├── shop/           # Obchodník
│   │   ├── quests/         # Denné úlohy
│   │   └── leaderboard/    # Rebríčky
│   ├── (admin)/            # Admin panel
│   ├── api/                # API routes (webhooks)
│   └── layout.tsx          # Root layout
├── components/             # React komponenty
│   ├── ui/                 # Základné UI (button, card, modal)
│   ├── game/               # Herné komponenty
│   └── admin/              # Admin komponenty
├── lib/                    # Business logic (moduly)
│   ├── auth/
│   ├── character/
│   ├── combat/
│   ├── economy/
│   ├── pve/
│   ├── pvp/
│   ├── items/
│   ├── activities/
│   ├── hideout/
│   ├── shop/
│   ├── quests/
│   ├── payments/
│   ├── admin/
│   ├── analytics/
│   └── notifications/
├── db/                     # Drizzle schema + migrations
│   ├── schema.ts
│   ├── migrations/
│   └── drizzle.config.ts
├── public/                 # Static assets
├── middleware.ts           # Next.js middleware (auth, rate limiting)
└── tailwind.config.ts     # Tailwind configuration
```
