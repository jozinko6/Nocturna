# Performance report — Nocturna

## 1. Prehľad

Tento dokument definuje performance ciele a metriky pre Nocturnu. Po nasadení budú sem pridávané reálne výsledky.

---

## 2. Ciele

### 2.1 Initial Load

| Metrika | Cieľ | Meranie |
|---|---|---|
| First Contentful Paint (FCP) | < 1.2s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Total Blocking Time (TBT) | < 200ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to Interactive (TTI) | < 3.0s | Lighthouse |
| Lighthouse Performance Score | > 90 | Lighthouse |

### 2.2 Server Response

| Metrika | Cieľ | Meranie |
|---|---|---|
| Server Action response time | < 500ms (p95) | Sentry Performance |
| API route response time | < 300ms (p95) | Sentry Performance |
| Database query time | < 100ms (p95) | Supabase Dashboard |
| Redis operation time | < 10ms (p95) | Upstash Dashboard |

### 2.3 Runtime

| Metrika | Cieľ | Meranie |
|---|---|---|
| Client JS bundle size | < 150KB (gzipped) | Next.js build output |
| Client JS execution time | < 50ms per interaction | Chrome DevTools |
| Memory usage | < 50MB | Chrome DevTools |
| Frame rate (animations) | 60 FPS | Chrome DevTools |

---

## 3. Optimalizácie

### 3.1 Server Components (default)

- Väčšina stránok je React Server Components
- Žiadny client JS pre read-only stránky
- `use client` len pre interaktívne komponenty

### 3.2 Lazy loading

| Komponent | Stratégia |
|---|---|
| Battle report detail | Dynamic import |
| Admin panel | Dynamic import |
| Leaderboard charts | Dynamic import |
| Merchant items | Lazy rendering |
| Inventory grid | Virtual scrolling (post-MVP) |

### 3.3 Image optimization

- Next.js Image komponent pre všetky obrázky
- Automatické WebP/AVIF konverzie
- Lazy loading pre off-screen images
- Responsive srcset

### 3.4 Caching

| Dáta | Cache stratégia | TTL |
|---|---|---|
| Static assets | CDN (Vercel) | 1 rok |
| Item templates | Server cache | 1 hodina |
| Leaderboards | Redis cache | 5 minút |
| Feature flags | Redis cache | 5 minút |
| Economy config | Redis cache | 5 minút |
| User sessions | JWT (stateless) | 7 dní |

### 3.5 Database optimization

| Technika | Implementácia |
|---|---|
| Indexy | ~80 indexov na kľúčové stĺpce |
| Connection pooling | Supabase built-in |
| Query optimization | Drizzle ORM (parameterized) |
| Pagination | Cursor-based pre všetky zoznamy |
| Select fields | Len potrebné stĺpce |

---

## 4. Anti-patterns (čomu sa vyhnúť)

| Anti-pattern | Riešenie |
|---|---|
| N+1 queries | JOINs alebo batch queries |
| Client-side data fetching (default) | Server Components |
| Large client bundles | Code splitting, lazy loading |
| Unnecessary re-renders | React.memo, useMemo |
| Missing indexes | Profilovanie queries |
| Unbounded queries | Pagination vždy |
| Stale data | SWR / React Query (post-MVP) |

---

## 5. Monitoring

### 5.1 Sentry Performance

- Transaction tracking pre server actions
- Span tracking pre DB queries
- Error rate monitoring
- P95 response time tracking

### 5.2 Vercel Analytics

- Core Web Vitals (FCP, LCP, TBT, CLS)
- Route-level performance
- Function invocation count
- Edge function latency

### 5.3 Custom metrics

```typescript
// Trackované metriky
- combat_round_duration_ms
- expedition_total_duration_ms
- energy_regen_calculation_ms
- loot_generation_ms
- merchant_rotation_ms
- daily_quest_generation_ms
```

---

## 6. Performance testovanie

### 6.1 Load testy (post-MVP)

| Scenár | Počet užívateľov | Cieľ |
|---|---|---|
| Concurrent expeditions | 100 | < 1s response |
| Concurrent PvP | 50 | < 2s response |
| Leaderboard fetch | 500 | < 500ms response |
| Merchant rotation | 1,000 | < 5s (batch) |

### 6.2 Stress testy (post-MVP)

| Scenár | Počet užívateľov | Cieľ |
|---|---|---|
| Spike traffic | 10,000 | Graceful degradation |
| Sustained load | 1,000 / hod | < 1s p95 |
| Database under load | 500 concurrent | < 100ms p95 |

---

## 7. Reálne výsledky

> **Táto sekcia bude aktualizovaná po nasadení.**

### 7.1 MVP Launch (deň 0)

| Metrika | Hodnota | Status |
|---|---|---|
| FCP | TBD | ⬜ |
| LCP | TBD | ⬜ |
| TBT | TBD | ⬜ |
| CLS | TBD | ⬜ |
| Lighthouse score | TBD | ⬜ |
| Bundle size | TBD | ⬜ |
| DB query p95 | TBD | ⬜ |

### 7.2 Post-launch týždeň 1

| Metrika | Hodnota | Status |
|---|---|---|
| Error rate | TBD | ⬜ |
| P95 response time | TBD | ⬜ |
| Active users | TBD | ⬜ |
| Server costs | TBD | ⬜ |

---

## 8. Budget

### 8.1 Infraštruktúrne náklady (MVP)

| Služba | Free tier | Odhad (1000 MAU) |
|---|---|---|
| Vercel | Hobby (zadarmo) | Pro (20 € / mesiac) |
| Supabase | Free (zadarmo) | Pro (25 € / mesiac) |
| Upstash | Pay-as-you-go | ~5 € / mesiac |
| Stripe | Pay-per-use | ~2 % z revenue |
| Sentry | Free (5K events) | Team (26 € / mesiac) |
| PostHog | Free (1M events) | Free (zadarmo) |
| Resend | Free (3K emails) | Pro (20 € / mesiac) |
| **Celkom** | | **~100 € / mesiac** |

### 8.2 Škálovanie

| MAU | Odhad náklady |
|---|---|
| 0–1,000 | 20–50 € / mesiac |
| 1,000–5,000 | 50–150 € / mesiac |
| 5,000–10,000 | 150–300 € / mesiac |
| 10,000+ | Custom |

---

## 9. Postup optimalizácie

1. **Measure** — Sentry + Vercel Analytics
2. **Identify** — Najpomalšie routes a queries
3. **Optimize** — Indexy, caching, lazy loading
4. **Verify** — Re-test po optimalizácii
5. **Monitor** — Continual monitoring

---

## 10. Known issues (MVP)

| Issue | Impact | Plán |
|---|---|---|
| Leaderboard bez pagination | High MAU = pomalé | Pridať cursor-based pagination |
| Merchant rotation bez cache | DB load pri rotácii | Cache v Redis |
| Battle reports bez virtualizácie | Veľa kôl = pomalý render | Virtual scrolling post-MVP |
