import { test, expect } from '@playwright/test'

test.describe('New Player Vertical Slice', () => {
  const uniqueEmail = `test_${Date.now()}@nocturna.test`
  const testName = 'TestHero'

  test('complete new player journey', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Nocturna')).toBeVisible()

    await page.click('text=Registrácia')
    await page.waitForURL('**/register')

    await page.fill('input[name="email"]', uniqueEmail)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
    await page.fill('input[name="displayName"]', testName)
    await page.click('button[type="submit"]')

    await page.waitForURL('**/onboarding')
    await page.click('text=Sangvari')

    await page.fill('input[name="characterName"]', testName)
    await page.click('text=Pokračovať')

    await page.click('[data-portrait="warrior_1"]')
    await page.click('text=Pokračovať')

    await page.waitForURL('**/dashboard')
    await expect(page.locator(`text=${testName}`)).toBeVisible()

    await page.click('text=Výpravy')
    await page.waitForURL('**/expeditions')

    await page.click('text=Bezpečná')
    await page.click('text=Začať výpravu')

    await page.waitForTimeout(21000)

    await page.click('text=Dokončiť')
    await page.click('text=Vyzdvihnúť odmenu')

    await page.click('text=Inventár')
    await page.waitForURL('**/inventory')

    await expect(
      page.locator('text=Ihla červeného úsvitu').or(page.locator('text=Tesák mesačnej hliadky')),
    ).toBeVisible()

    await page.click('text=Nasadiť')

    await page.click('text=PvP')
    await page.waitForURL('**/pvp')

    await page.click('text=Hľadať súperov')
    await page.click('text=Útočiť >> nth=0')

    await expect(
      page.locator('text=Výsledok súboja').or(page.locator('text=Kolo')),
    ).toBeVisible()
  })
})
