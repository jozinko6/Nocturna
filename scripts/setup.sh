#!/bin/bash
set -e

echo "Nocturna — Local Development Setup"
echo "=================================="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
  echo "Error: Node.js v22+ required. Current: $(node -v)"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check for .env.local
if [ ! -f .env.local ]; then
  echo ""
  echo "Creating .env.local from template..."
  cp .env.template .env.local
  echo ""
  echo "WARNING: Edit .env.local with your actual credentials before running the app."
  echo "  - DATABASE_URL: PostgreSQL connection string"
  echo "  - SUPABASE_URL/KEYS: From Supabase project settings"
  echo "  - STRIPE_SECRET_KEY/WEBHOOK_SECRET: From Stripe dashboard"
  echo ""
fi

# Run Drizzle migrations
echo ""
echo "Pushing database schema..."
if [ -n "$DATABASE_URL" ]; then
  npx drizzle-kit push
  echo "Schema pushed successfully."
else
  echo "WARNING: DATABASE_URL not set. Skipping schema push."
  echo "  Set DATABASE_URL in .env.local and run: npx drizzle-kit push"
fi

# Seed database
if [ "$1" = "--seed" ] && [ -n "$DATABASE_URL" ]; then
  echo ""
  echo "Seeding database..."
  npx tsx scripts/seed-vertical-slice.ts
  echo "Seeding complete."
fi

# Verify
echo ""
echo "Verifying setup..."
npx tsc --noEmit --skipLibCheck 2>/dev/null && echo "TypeScript: OK" || echo "TypeScript: Errors (may need DATABASE_URL)"

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your credentials"
echo "  2. Run: npm run dev"
echo "  3. Visit: http://localhost:3000"
echo ""
