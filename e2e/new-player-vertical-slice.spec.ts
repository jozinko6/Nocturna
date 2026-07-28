import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY

test.describe('New Player Vertical Slice', () => {
  test('protects private pages and completes onboarding', async ({ page }) => {
    test.setTimeout(120000)
    test.skip(!supabaseUrl || !serviceKey, 'Supabase admin credentials are required')
    page.on('pageerror', (error) => console.error(`Browser page error: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') console.error(`Browser console error: ${message.text()}`)
    })

    const admin = createClient(supabaseUrl!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const suffix = randomUUID()
    const email = `e2e-${suffix}@example.com`
    const password = `Noc!${randomUUID()}a7`
    const displayName = `E2E-${suffix.slice(0, 8)}`
    const characterName = `Hero-${suffix.slice(0, 8)}`

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    })
    expect(error).toBeNull()
    expect(data.user).toBeTruthy()
    if (!data.user) throw new Error('Supabase did not return the created test user')
    const userId = data.user.id

    try {
      await test.step('redirect an anonymous player to login', async () => {
        await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
        await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/)
      })

      await test.step('sign in and reach onboarding', async () => {
        await page.getByLabel('Email', { exact: true }).fill(email)
        await page.getByLabel('Heslo', { exact: true }).fill(password)
        await page.getByRole('button', { name: 'Prihlásiť sa' }).click()
        await expect(page).toHaveURL(/\/onboarding$/, { timeout: 30000 })
      })

      await test.step('choose faction and character identity', async () => {
        await expect(page.getByText('Sangvari', { exact: true })).toBeVisible({ timeout: 15000 })
        await page.getByText('Sangvari', { exact: true }).click()
        await page.getByRole('button', { name: 'Pokračovať' }).click()

        await page.getByLabel('Meno postavy', { exact: true }).fill(characterName)
        await page.getByRole('button', { name: 'Pokračovať' }).click()

        await page.getByText('Bojovník', { exact: true }).click()
        await page.getByRole('button', { name: 'Pokračovať' }).click()
      })

      await test.step('create the character and enter the game', async () => {
        await page.getByRole('button', { name: 'Vytvoriť postavu' }).click()
        await expect.poll(async () => {
          const { data: character } = await admin
            .from('characters')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()
          return character?.id ?? null
        }, { timeout: 15000 }).not.toBeNull()
        await expect(page).toHaveURL(/\/expeditions$/, { timeout: 30000 })
        await expect(page.getByText(characterName, { exact: true })).toBeVisible()
      })
    } finally {
      await admin.auth.admin.deleteUser(userId)
    }
  })
})
