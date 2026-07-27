# Architektonické rozhodnutia — Nocturna

## 1. Prehľad

Tento dokument zdokumentuje kľúčové architektonické rozhodnutia prijaté pre Nocturnu, vrátane kontextu, alternatív a finálneho rozhodnutia.

---

## 2. Prehľad rozhodnutí

| # | Otázka | Rozhodnutie |
|---|---|---|
| 1 | Framework | Next.js (App Router) |
| 2 | Databáza + Auth | Supabase |
| 3 | ORM | Drizzle ORM |
| 4 | Cooldowns / Cache | Redis (Upstash) |
| 5 | Bezpečnostný model | Server-authoritative |
| 6 | Architektonický vzor | Modular monolith |

---

## 3. Rozhodnutie #1: Prečo Next.js

### Kontext
Browser RPG potrebuje full-stack riešenie — server-side rendering pre rýchle načítanie, server actions pre herné akcie, API routes pre webhooks.

### Alternatívy zvažované

| Alternatíva | Výhody | Nevýhody |
|---|---|---|
| **Next.js (App Router)** | Full-stack, SSR, Server Components, mature ecosystem | Vendor lock-in (Vercel optional), learning curve |
| **Remix** | Nested routing, progressive enhancement | Menší ekosystém, menej Server Component podpora |
| **SvelteKit** | Rýchlejší client, menej boilerplate | Menší tím, menej nástrojov |
| **Separate BE + FE** | Flexibilita v technológiách | Viac deployment target, duplex kód |

### Rozhodnutie
**Next.js s App Router.**

### Dôvody
- **Full-stack v jednom projekte** — žiadne oddelené BE/FE repo
- **Server Components** — väčšina stránok bez client JS = rýchle načítanie
- **Server Actions** — typovo bezpečné volania z klienta na server bez API boilerplate
- **File-based routing** — intuitívna štruktúra
- **Mature ecosystem** — veľká komunita, veľa nástrojov
- **Vercel deployment** — zero-config, automatické preview URL

---

## 4. Rozhodnutie #2: Prečo Supabase

### Kontext
Hra potrebuje autentifikáciu, databázu a potenciálne file storage (pre avatary, item obrázky).

### Alternatívy zvažované

| Alternatíva | Výhody | Nevýhody |
|---|---|---|
| **Supabase** | Auth + DB + Storage + Realtime v jednom | Vendor lock-in, pricing scales |
| **Firebase** | Google ekosystém, realtime | NoSQL (menej vhodné pre RPG), pricing |
| **Clerk + PlanetScale** | Modern auth + serverless DB | Viac služieb, viac integrácií |
| **Self-hosted (PostgreSQL + Keycloak)** | Full control | Viac práce na prevádzku |

### Rozhodnutie
**Supabase.**

### Dôvody
- **Auth hotový** — email/password, JWT, session management — bez potreby budovať vlastný
- **PostgreSQL** — robustná, SQL, row-level security
- **Row Level Security** — prirodzená integrácia s auth (RLS policies)
- **File Storage** — pripravené pre avatary a item obrázky
- **Dashboard** — admin UI pre správu databázy
- **Generátory** — SQL generátor, API generátor
- **Pricing** — generous free tier, potom pay-as-you-go

---

## 5. Rozhodnutie #3: Prečo Drizzle ORM

### Kontext
Potrebujeme type-safe prístup k PostgreSQL z TypeScript.

### Alternatívy zvažované

| Alternatíva | Výhody | Nevýhody |
|---|---|---|
| **Drizzle ORM** | Type-safe, lightweight, SQL-like API, rýchly | Mladší, menej feature-rich |
| **Prisma** | Mature, great DX, migration tooling | Heavy, runtime engine, pomalší |
| **TypeORM** | Mature, decorated entities | Boilerplate, menej type-safe |
| **Raw SQL** | Full control, žiadny overhead | Žiadny type safety, prone to errors |
| **Kysely** | Lightweight, type-safe | Menej features, menší ekosystém |

### Rozhodnutie
**Drizzle ORM.**

### Dôvody
- **Type-safe** — compile-time overenie všetkých queries
- **Lightweight** — žiadny runtime engine, generuje čistý SQL
- **SQL-like API** — ak poznáte SQL, poznáte Drizzle
- **Schema as code** — definícia schémy v TypeScript
- **Migration support** — Drizzle Kit pre migrácie
- **Performance** — najrýchlejší TypeScript ORM v benchmarkoch
- **Supabase-friendly** — funguje s akýmkoľvek PostgreSQL, vrátane Supabase

---

## 6. Rozhodnutie #4: Prečo Redis pre cooldowns

### Kontext
Hra má mnoho cooldownov (energie regenerácia, tréning, PvP limit, denné úlohy). Potrebujeme rýchle a spoľahlivé sledovanie.

### Alternatívy zvažované

| Alternatíva | Výhody | Nevýhody |
|---|---|---|
| **Redis (Upstash)** | TTL, atomic operations, serverless | Ďalšia služba, pricing |
| **Cron-based (DB)** | Jednoduché | Nepresné (zavisí od intervalu cronu), neškálovateľné |
| **PostgreSQL + timestamps** | Všetko v jednej DB | Pomalšie, viac queries, žiadny auto-cleanup |
| **In-memory (Node.js)** | Rýchle | Strata dát pri restarte, neškálovateľné |

### Rozhodnutie
**Redis (Upstash) s TTL-based cooldowns.**

### Dôvody
- **TTL (Time-To-Live)** — automatické mazanie expiry keys, žiadny cleanup needed
- **Atomic operations** — INCR, SETNX pre race condition ochranu
- **Sub-millisecond latency** — rýchlejšie ako akákoľvek DB operácia
- **Serverless-friendly** — Upstash = serverless Redis, žiadna infraštruktúra
- **Pre Energy regeneráciu** — presný čas, nie aproximácia cez cron

### Príklad: Energy regenerácia

```
// Keď hráč minie energiu:
SET energy:{userId} 85 EX 7200   // 85 energie, expiruje za 2h (keď sa doplní na 100)

// Keď hráč príde na stránku:
GET energy:{userId}
→ Vypočítaj: currentEnergy + (elapsed / 360)
→ Obmedz na max 100
```

---

## 7. Rozhodnutie #5: Prečo server-authoritative

### Kontext
Browser RPG je náchylný na cheaty (automatizácia, memory editing, packet manipulation).

### Alternatívy zvažované

| Alternatíva | Výhody | Nevýhody |
|---|---|---|
| **Server-authoritative** | Anti-cheat, konzistencia | Viac server load, pomalšie UI feedback |
| **Client-authoritative** | Rýchlejšie UI, menej server load | Ľahko cheatovateľné |
| **Hybridné** | Balance | Komplexné, stále cheatovateľné |

### Rozhodnutie
**Server-authoritative.**

### Dôvody
- **Anti-cheat** — klient nikdy neverí. Všetky výpočty na serveri.
- **Data integrity** — žiadne desync medzi klientom a serverom
- **Jednoduchosť** — menej edge cases, menej bugs
- **Konšistencia** — všetci hráči vidia rovnaké dáta

### Princípy

| Čo je server-side | Čo je client-side |
|---|---|
| Combat výpočty | UI renderovanie |
| Energy regenerácia | Animačné efekty |
| Gold / Crystal operácie | Formuláre |
| Loot generovanie | Zvukové efekty |
| Rating výpočty | Navigácia |
| Quest progress | Toast notifikácie |

---

## 8. Rozhodnutie #6: Prečo modular monolith

### Kontext
MVP hra s malým tímom. Potrebujeme jednoduchosť, ale zároveň chceme čistý kód.

### Alternatívy zvažované

| Alternatíva | Výhody | Nevýhody |
|---|---|---|
| **Modular monolith** | Jednoduchý deployment, jednoduchý debugging | Scaling limity |
| **Microservices** | Nezávislé deployment, tech diversity | Komplexný orchestration, debugging |
| **Serverless functions** | Auto-scaling, pay-per-use | Cold start, state management |

### Rozhodnutie
**Modular monolith.**

### Dôvody
- **MVP jednoduchosť** — jeden deploy, jeden log, jeden debugger
- **Modulárne hranice** — čisté API medzi modulmi, ľahké refaktorovanie
- **Post-MVP migrácia** — ak bude potrebné, moduly sa dajú oddeliť do servisov
- **Team scaling** — pri raste tímu sa moduly dajú delegovať
- **Testing** — jednoduchšie integration testy

### Pravidlá modularity

1. Každý modul má verejné API (server actions)
2. Moduly sa volajú cez svoje API, nie cez interné funkcie
3. Žiadne krížové závislosti na DB leveli (ak je to možné)
4. Každý modul má vlastné types
5. Zdieľané utility v `lib/shared/`

---

## 9. Ďalšie rozhodnutia

### 9.1 Tailwind CSS

- **Prečo:** Utility-first, rýchle prototypovanie, dark theme built-in, responsive
- **Alternatívy:** CSS Modules (menej produktívne), styled-components (runtime overhead)

### 9.2 Vitest + Playwright

- **Prečo:** Vitest = rýchle unit testy, Playwright = E2E testy v reálnom prehliadači
- **Alternatívy:** Jest (pomalší), Cypress (drahší, menej stabilný)

### 9.3 Stripe (nie PayPal)

- **Prečo:** Better developer experience, webhooks, subscriptions, EU compliant
- **Alternatívy:** PayPal (horší DX), Paddle (menej mainstream)

### 9.4 Upstash Redis (nie self-hosted)

- **Prečo:** Serverless, zero ops, generous free tier
- **Alternatívy:** Redis Cloud (drahší), self-hosted (viac práce)

### 9.5 PostHog (nie Mixpanel/Amplitude)

- **Prečo:** Open-source, self-hostable, feature flags built-in, generous free tier
- **Alternatívy:** Mixpanel (drahší), Amplitude (drahší), GA4 (menej game-specific)

---

## 10. Zhrnutie

Nocturna je navrhnutá pre **rýchlu MVP implementáciu** s **čistým kódom** a **bezpečnou architektúrou**. Každé rozhodnutie uprednostňuje:

1. **Jednoduchosť** nad komplexitou
2. **Type safety** nad rýchlosťou prototypovania
3. **Server-side** nad client-side
4. **Hotové riešenia** nad vlastnou implementáciou
5. **Post-MVP extensibility** nad gold-plating
