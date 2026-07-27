# Contributing to Nocturna

## Development Setup
1. Clone the repository
2. Run `bash scripts/setup.sh`
3. Copy `.env.template` to `.env.local`
4. Start dev server: `npm run dev`

## Code Style
- TypeScript strict mode
- 2-space indentation
- Single quotes for strings
- Trailing commas
- Functional components with hooks
- Server Actions for mutations
- Drizzle ORM for database queries

## File Structure
```
src/
  app/           — Next.js App Router pages and actions
  components/    — React components
  game/          — Game logic (pure functions, no DB)
  lib/           — Shared utilities, DB schema, config
  __tests__/     — Unit tests
tests/           — Integration/load tests
```

## Testing
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npx vitest run --reporter=verbose
```

## Pull Requests
1. Create feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with clear description

## Database Changes
- Use `npx drizzle-kit generate` to create migration
- Never modify existing migrations
- Additive changes only (no destructive migrations)
- Update schema in `src/lib/db/schema.ts`

## Commit Messages
Follow conventional commits:
- `feat: add new feature`
- `fix: resolve bug`
- `refactor: improve existing code`
- `test: add tests`
- `docs: update documentation`
