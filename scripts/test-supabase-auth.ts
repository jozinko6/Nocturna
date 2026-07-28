import { randomUUID } from 'node:crypto'
import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'

loadEnvConfig(process.cwd())

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !publicKey || !serviceKey) {
  throw new Error('Supabase URL, public key, and service role key are required')
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const createdUserIds: string[] = []

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function createTestUser(label: string) {
  const suffix = randomUUID()
  const email = `codex-${label}-${suffix}@example.com`
  const password = `Noc!${randomUUID()}a7`
  const displayName = `Codex-${label}-${suffix.slice(0, 8)}`

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })
  if (error) throw error
  createdUserIds.push(data.user.id)

  const client = createClient(supabaseUrl!, publicKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error: signInError } = await client.auth.signInWithPassword({ email, password })
  if (signInError) throw signInError

  return { client, id: data.user.id }
}

async function main() {
  const first = await createTestUser('alpha')
  const second = await createTestUser('beta')

  const { data: firstUser, error: firstUserError } = await first.client
    .from('users')
    .select('id, role')
    .single()
  if (firstUserError) throw firstUserError
  assert(firstUser.id === first.id, 'The user can read a different users row')
  assert(firstUser.role === 'player', 'A new account did not receive the player role')

  const { data: firstProfile, error: profileError } = await first.client
    .from('profiles')
    .select('user_id, display_name')
    .single()
  if (profileError) throw profileError
  assert(firstProfile.user_id === first.id, 'Auth profile trigger did not create the expected profile')

  const { data: leakedUser, error: leakedUserError } = await first.client
    .from('users')
    .select('id')
    .eq('id', second.id)
    .maybeSingle()
  if (leakedUserError) throw leakedUserError
  assert(leakedUser === null, 'RLS exposed another users private row')

  const { data: faction, error: factionError } = await first.client
    .from('factions')
    .select('id')
    .limit(1)
    .single()
  if (factionError) throw factionError

  const { data: character, error: characterError } = await first.client
    .from('characters')
    .insert({ user_id: first.id, faction_id: faction.id, name: `E2E-${randomUUID().slice(0, 8)}` })
    .select('id')
    .single()
  if (characterError) throw characterError

  const { error: statsError } = await first.client
    .from('character_stats')
    .insert({ character_id: character.id })
  if (statsError) throw statsError

  const { data: leakedStats, error: leakedStatsError } = await second.client
    .from('character_stats')
    .select('id')
    .eq('character_id', character.id)
  if (leakedStatsError) throw leakedStatsError
  assert(leakedStats.length === 0, 'RLS exposed another characters private stats')

  const { data: modifiedCharacter, error: updateError } = await second.client
    .from('characters')
    .update({ gold: 999999 })
    .eq('id', character.id)
    .select('id')
  if (updateError) throw updateError
  assert(modifiedCharacter.length === 0, 'RLS allowed another user to mutate a character')

  console.log('Supabase auth triggers and ownership isolation passed')
}

main()
  .finally(async () => {
    for (const userId of createdUserIds) {
      const { error } = await admin.auth.admin.deleteUser(userId)
      if (error) console.error(`Failed to remove test user ${userId}: ${error.message}`)
    }
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
