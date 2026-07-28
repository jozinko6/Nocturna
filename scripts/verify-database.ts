import { loadEnvConfig } from '@next/env'
import postgres from 'postgres'

loadEnvConfig(process.cwd())

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL is required')
}

const sql = postgres(databaseUrl, { prepare: false })

async function main() {
try {
  const [summary] = await sql<{
    tableCount: number
    rlsTableCount: number
    policyCount: number
    migrationCount: number
  }[]>`
    select
      (select count(*)::int from pg_tables where schemaname = 'public') as "tableCount",
      (select count(*)::int from pg_tables where schemaname = 'public' and rowsecurity) as "rlsTableCount",
      (select count(*)::int from pg_policies where schemaname = 'public') as "policyCount",
      (select count(*)::int from supabase_migrations.schema_migrations) as "migrationCount"
  `

  const [seed] = await sql<{
    factions: number
    regions: number
    enemies: number
    items: number
    featureFlags: number
  }[]>`
    select
      (select count(*)::int from public.factions) as factions,
      (select count(*)::int from public.regions) as regions,
      (select count(*)::int from public.enemies) as enemies,
      (select count(*)::int from public.item_templates) as items,
      (select count(*)::int from public.feature_flags) as "featureFlags"
  `

  const triggers = await sql<{ triggerName: string }[]>`
    select trigger_name as "triggerName"
    from information_schema.triggers
    where event_object_schema = 'auth'
      and event_object_table = 'users'
      and trigger_name in ('on_auth_user_created', 'on_auth_user_updated', 'on_auth_user_deleted')
    order by trigger_name
  `

  if (!summary || summary.tableCount !== summary.rlsTableCount) {
    throw new Error('Not every public table has row-level security enabled')
  }
  if (triggers.length !== 3) {
    throw new Error('Supabase auth synchronization triggers are incomplete')
  }
  if (!seed || seed.factions < 2 || seed.regions < 1 || seed.enemies < 1 || seed.items < 1) {
    throw new Error('Required game seed data is incomplete')
  }

  console.log(JSON.stringify({ ...summary, seed, triggers: triggers.map((row) => row.triggerName) }, null, 2))
} finally {
  await sql.end()
}
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
