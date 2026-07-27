# Nocturna

Temná fantasy browser RPG postavená na Next.js 16, Supabase a Drizzle ORM. Hráči si volia frakciu (Sangvari alebo Lunari), prezkúmajú 4 regióny, bojujú s 12+ druhmi nepriateľov, spravujú úkryt, plnia denné úlohy a súperia v PvP aréne.

## Features

- **2 frakcie** — Sangvari (krv, presnosť, kritické zásahy) a Lunari (regenerácia, odolnosť, nočná moc)
- **4 regióny** s odporúčanou úrovňou a unikátnymi nepriateľmi
- **12+ nepriateľov** (normal, elite, boss) s loot tabuľkami
- **40+ predmetov** — zbrane, brnenia, prívesky, prstene, relikvie a spotrebné predmety
- **Bojový engine** — deterministický simulátor s kritickými zásahmi, úhybmi, blokovaním a lifestealom
- **Výpravy (PvE)** — expedičné udalosti s voľbou obtiažnosti
- **PvP aréna** — ELO rating systém, 6 líg
- **Denné úlohy a odmeny** — týždenný streak systém
- **Úkryt (hideout)** — 5 budov s 5 úrovňami, pasívne bonusy
- **Tréning atribútov** — 5 atribútov, stúpajúce náklady
- **Obchod** — rotujúci shop, nákup za zlato
- **Premium shop** — kryštály, členstvo, kozmetika (Stripe integrácia)
- **Admin panel** — správa hráčov, ekonomika, bezpečnosť, konfigurácia
- **Ledger systém** — plná auditovateľnosť všetkých transakcií
- **Feature flags** — postupné nasadzovanie funkcií
- **Email notifikácie** (Resend), **monitoring** (Sentry), **analytics** (PostHog)

## Tech Stack

| Vrstva | Technológia |
|--------|-------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js Server Actions, API Routes |
| Database | PostgreSQL (Supabase), Drizzle ORM |
| Auth | Supabase Auth (SSR) |
| Cache | Redis (Upstash) |
| Payments | Stripe |
| Email | Resend |
| Monitoring | Sentry |
| Analytics | PostHog |
| Testing | Vitest, Playwright |
| Language | TypeScript 5 |

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+ (or Supabase CLI for local dev)
- **Redis** (optional, pre cachovanie)
- **pnpm** / **npm** / **yarn**

## Installation

```bash
git clone https://github.com/your-org/nocturna.git
cd nocturna
npm install
```

## Environment Setup

```bash
cp .env.example .env.local
```

Uprav `.env.local` podľa svojho prostredia. Pre lokálny vývoj s Supabase CLI:

```bash
npx supabase start
npx supabase db push
```

Alebo použi lokálnu PostgreSQL inštanciu a spusti migrácie:

```bash
npx drizzle-kit push
```

## Database Setup

### Supabase (odporúčané)

```bash
# Spusti Supabase lokálne
npx supabase start

# Aplikuj schému
npx drizzle-kit push
```

### Lokálna PostgreSQL

```bash
# Vytvor databázu
createdb nocturna

# Nastav DATABASE_URL v .env.local
# Aplikuj schému
npx drizzle-kit push
```

## Seed Data

```bash
npx tsx scripts/seed.ts
```

Seed vytvorí:
- 2 frakcie (Sangvari, Lunari)
- 4 regióny s 12 nepriateľmi
- 40+ šablón predmetov
- Denné úlohy
- Konfiguráciu úkrytu
- Nastavenie ekonomiky
- Feature flagy (všetky MVP povolené)
- 2 demo účty (len v development)

## Running Locally

```bash
npm run dev
```

Otvor [http://localhost:3000](http://localhost:3000).

### Demo účty (development)

| Email | Heslo | Frakcia |
|-------|-------|---------|
| valeria@nocturna.dev | — (magic link) | Sangvari |
| lunaris@nocturna.dev | — (magic link) | Lunari |

## Testing

### Unit testy

```bash
npm run test          # Vitest
npm run test:coverage # S coverage reportom
```

### E2E testy

```bash
npm run test:e2e      # Playwright
```

### Dostupné testovacie skripty

```bash
# Simulácia bojov (10 000 bitiek)
npx tsx scripts/simulate-combat.ts

# Audit ekonomiky (ledger kontrola)
npx tsx scripts/check-ledger.ts
```

## Build

```bash
npm run build
npm run start
```

## Deployment (Vercel)

1. Pushni repozitár na GitHub
2. Pripoj projekt vo [Vercel](https://vercel.com)
3. Nastav environment variables
4. Deploy

```bash
# Alebo cez CLI
npx vercel --prod
```

### Cron endpointy

- `/api/cron/daily-reset` — denný reset úloh a odmien (nastav v Vercel cron jobs)

## Project Structure

```
nocturna/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Prihlásenie / registrácia
│   │   ├── (game)/             # Hlavná herná obrazovka
│   │   ├── (admin)/            # Admin panel
│   │   ├── actions/            # Server Actions
│   │   ├── api/                # API routes (webhooks, cron, health)
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Základné UI komponenty
│   │   └── layout/             # Layout komponenty
│   └── lib/
│       ├── config/             # Herné konfigurácie
│       │   ├── game.ts         # Master game config
│       │   ├── factions.ts     # Frakcie
│       │   ├── regions.ts      # regióny
│       │   ├── enemies.ts      # Nepriatelia
│       │   ├── items.ts        # Predmety
│       │   ├── hideout.ts      # Úkryt budovy
│       │   ├── daily-quests.ts # Denné úlohy
│       │   ├── expeditions.ts  # Výpravy
│       │   ├── shop.ts         # Obchod
│       │   └── monetization.ts # Monetizácia
│       ├── db/
│       │   ├── schema.ts       # Drizzle schéma
│       │   ├── index.ts        # DB exports
│       │   ├── combat.ts       # Bojový engine
│       │   ├── economy.ts      # Ekonomické funkcie
│       │   ├── energy.ts       # Energy management
│       │   └── missions.ts     # Missions
│       ├── supabase/           # Supabase client (SSR + browser)
│       ├── utils/              # Utility funkcie
│       └── i18n/               # Internacionalizácia
├── scripts/
│   ├── seed.ts                 # Databázový seed
│   ├── simulate-combat.ts      # Simulácia bojov
│   └── check-ledger.ts         # Audit ekonomiky
├── docs/                       # Projektová dokumentácia
├── drizzle.config.ts           # Drizzle Kit konfigurácia
├── next.config.ts              # Next.js konfigurácia
├── tailwind.config.ts          # Tailwind konfigurácia
└── vitest.config.ts            # Vitest konfigurácia
```

## Available Scripts

| Script | Popis |
|--------|-------|
| `npm run dev` | Spusti development server |
| `npm run build` | Build pre produkciu |
| `npm run start` | Spusti produkčný server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest testy |
| `npm run test:e2e` | Playwright E2E testy |
| `npx drizzle-kit push` | Aplikuj schému na DB |
| `npx drizzle-kit studio` | Otvor Drizzle Studio |
| `npx tsx scripts/seed.ts` | Naplň DB seed dátami |
| `npx tsx scripts/simulate-combat.ts` | Simulácia 10 000 bojov |
| `npx tsx scripts/check-ledger.ts` | Audit ekonomického ledgeru |

## Contributing

1. Forkni repozitár
2. Vytvor feature branch (`git checkout -b feature/`)
3. Commitni zmeny (`git commit -m 'Pridaj funkciu'`)
4. Pushni na branch (`git push origin feature/`)
5. Otvor Pull Request

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Drizzle ORM pre DB operácie
- Server Actions pre mutácie
- Žiadne `any` tipy (ak je to možné)

## License

Súkromný projekt. Bez súhlasu autora nie je povolené šírenie ani použitie.
