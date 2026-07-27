'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { BOT_OPPONENTS, findSuitableBots } from '@/game/pvp'
import { generateSeed, createRng } from '@/game/rng'
import { createPlayerSnapshot, createEnemySnapshot, CombatantSnapshot } from '@/game/snapshot'
import { simulateBattle } from '@/game/combat'
import { levelFromExperience } from '@/game/formulas'
import { PVP_MIN_LEVEL, PVP_COOLDOWN_SECONDS, PVP_DAILY_LIMIT, PVP_XP_REWARD, PVP_GOLD_REWARD, EQUIPMENT_SLOT_TYPES } from '@/game/config'

const attackOpponentSchema = z.object({
  defenderId: z.string().uuid('Invalid defender ID'),
})

const getBattleReportsSchema = z.object({
  type: z.enum(['pve', 'pvp']),
  page: z.number().int().positive().default(1),
})

const getBattleReportSchema = z.object({
  reportId: z.string().uuid('Invalid report ID'),
})

function getLeagueFromRating(rating: number): string {
  if (rating >= 1800) return 'vládca_noci'
  if (rating >= 1500) return 'prastarý'
  if (rating >= 1200) return 'mesiac'
  if (rating >= 1000) return 'krv'
  if (rating >= 800) return 'železo'
  return 'tieň'
}

export async function findOpponents() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('id, level')
      .eq('user_id', user.id)
      .single()
    if (characterError || !character) return { success: false, error: 'Character not found' }

    const { data: pvpRating } = await supabase
      .from('pvp_ratings')
      .select('rating')
      .eq('character_id', character.id)
      .maybeSingle()

    const currentRating = pvpRating?.rating || 1000
    const bots = findSuitableBots(currentRating, 5)

    return { success: true, data: { opponents: bots } }
  } catch (error) {
    console.error('Find opponents error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function attackOpponent(defenderId: string) {
  try {
    const validated = attackOpponentSchema.safeParse({ defenderId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, level, experience, gold, pvp_wins, pvp_losses')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    if (character.level < PVP_MIN_LEVEL) {
      return { success: false, error: `New player protection: Complete level ${PVP_MIN_LEVEL} to participate in PvP` }
    }

    // Get or create PvP rating
    let { data: attackerRating } = await supabase
      .from('pvp_ratings')
      .select('*')
      .eq('character_id', character.id)
      .maybeSingle()

    if (!attackerRating) {
      const { data: newRating } = await supabase
        .from('pvp_ratings')
        .insert({ character_id: character.id, rating: 1000, league: 'tieň' })
        .select()
        .single()
      attackerRating = newRating
    }

    // Check cooldown
    if (attackerRating.last_attack_at) {
      const lastAttack = new Date(attackerRating.last_attack_at).getTime()
      const now = Date.now()
      const secondsSince = (now - lastAttack) / 1000
      if (secondsSince < PVP_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(PVP_COOLDOWN_SECONDS - secondsSince)
        return { success: false, error: `Attack cooldown: Wait ${remaining} seconds` }
      }
    }

    // Check daily limit
    const lastAttackDate = attackerRating.last_attack_at
      ? new Date(attackerRating.last_attack_at).toISOString().split('T')[0]
      : null
    const today = new Date().toISOString().split('T')[0]
    const attacksToday = lastAttackDate === today ? attackerRating.attacks_today : 0

    if (attacksToday >= PVP_DAILY_LIMIT) {
      return { success: false, error: `Daily attack limit reached (${PVP_DAILY_LIMIT})` }
    }

    // Find defender (bot or player)
    const isBot = defenderId.startsWith('bot_')
    let defenderSnapshot: CombatantSnapshot
    let defenderRatingValue: number
    let defenderCharacterId: string | null = null

    if (isBot) {
      const bot = BOT_OPPONENTS.find(b => b.id === defenderId)
      if (!bot) return { success: false, error: 'Bot not found' }
      defenderRatingValue = bot.rating
      defenderSnapshot = createEnemySnapshot(bot.name, bot.level, bot.level * 10 + 50, bot.stats.strength * 2, bot.stats.endurance * 2)
    } else {
      const { data: defender } = await supabase
        .from('characters')
        .select('id, level, experience')
        .eq('id', defenderId)
        .neq('id', character.id)
        .maybeSingle()
      if (!defender) return { success: false, error: 'Defender not found' }
      if (defender.level < PVP_MIN_LEVEL) {
        return { success: false, error: 'Defender has new player protection' }
      }

      defenderCharacterId = defender.id

      const { data: defRating } = await supabase
        .from('pvp_ratings')
        .select('rating')
        .eq('character_id', defender.id)
        .maybeSingle()
      defenderRatingValue = defRating?.rating || 1000

      const { data: defStats } = await supabase
        .from('character_stats')
        .select('*')
        .eq('character_id', defender.id)
        .maybeSingle()

      const { data: defResources } = await supabase
        .from('character_resources')
        .select('hit_points, max_hit_points')
        .eq('character_id', defender.id)
        .maybeSingle()

      const defEquipment: Record<string, any> = {}
      const { data: defSlots } = await supabase
        .from('equipment_slots')
        .select('slot_type, character_items (id, item_templates (*))')
        .eq('character_id', defender.id)

      if (defSlots) {
        for (const slot of defSlots) {
          const items = slot.character_items as any
          if (items?.item_templates) defEquipment[slot.slot_type] = items.item_templates
        }
      }

      defenderSnapshot = createPlayerSnapshot(
        defender.id,
        'Defender',
        defender.level,
        { strength: defStats?.strength || 5, dexterity: defStats?.dexterity || 5,
          endurance: defStats?.endurance || 5, perception: defStats?.perception || 5,
          willpower: defStats?.willpower || 5, luck: defStats?.luck || 5 },
        defEquipment,
        defResources?.hit_points || 100,
        defResources?.max_hit_points || 100,
      )
    }

    // Build attacker snapshot
    const { data: atkStats } = await supabase
      .from('character_stats')
      .select('*')
      .eq('character_id', character.id)
      .single()

    const { data: atkResources } = await supabase
      .from('character_resources')
      .select('hit_points, max_hit_points')
      .eq('character_id', character.id)
      .single()

    const atkEquipment: Record<string, any> = {}
    const { data: atkSlots } = await supabase
      .from('equipment_slots')
      .select('slot_type, character_items (id, item_templates (*))')
      .eq('character_id', character.id)

    if (atkSlots) {
      for (const slot of atkSlots) {
        const items = slot.character_items as any
        if (items?.item_templates) atkEquipment[slot.slot_type] = items.item_templates
      }
    }

    const attackerSnapshot = createPlayerSnapshot(
      character.id,
      'Player',
      character.level,
      { strength: atkStats?.strength || 5, dexterity: atkStats?.dexterity || 5,
        endurance: atkStats?.endurance || 5, perception: atkStats?.perception || 5,
        willpower: atkStats?.willpower || 5, luck: atkStats?.luck || 5 },
      atkEquipment,
      atkResources?.hit_points || 100,
      atkResources?.max_hit_points || 100,
    )

    // Simulate battle
    const seed = generateSeed()
    const rng = createRng(seed)
    const battleResult = simulateBattle(attackerSnapshot, defenderSnapshot, rng)
    const victory = battleResult.winner === 'attacker'

    // Calculate Elo change
    const kFactor = 32
    const expectedScore = 1 / (1 + Math.pow(10, (defenderRatingValue - attackerRating.rating) / 400))
    const eloChange = Math.round(kFactor * (victory ? 1 - expectedScore : -expectedScore))
    const absChange = Math.abs(eloChange)

    const newAttackerRating = victory
      ? attackerRating.rating + absChange
      : Math.max(100, attackerRating.rating - absChange)

    // Create battle report
    const { data: battleReport, error: brError } = await supabase
      .from('battle_reports')
      .insert({
        attacker_id: character.id,
        defender_id: defenderCharacterId,
        battle_type: 'pvp',
        seed,
        rounds: battleResult.rounds,
        result: {
          winner: battleResult.winner,
          totalAttackerDamage: battleResult.totalAttackerDamage,
          totalDefenderDamage: battleResult.totalDefenderDamage,
          attackerRatingBefore: attackerRating.rating,
          defenderRatingBefore: defenderRatingValue,
          ratingChange: eloChange,
        },
        winner_id: victory ? character.id : defenderCharacterId,
        attacker_snapshot: attackerSnapshot,
        defender_snapshot: defenderSnapshot,
        engine_version: '0.1.0',
      })
      .select()
      .single()

    if (brError || !battleReport) {
      console.error('Battle report error:', brError)
      return { success: false, error: 'Failed to create battle report' }
    }

    // Update attacker rating and stats
    const newWins = victory ? character.pvp_wins + 1 : character.pvp_wins
    const newLosses = victory ? character.pvp_losses : character.pvp_losses + 1
    const newAttackCount = lastAttackDate === today ? attacksToday + 1 : 1

    await supabase
      .from('pvp_ratings')
      .update({
        rating: newAttackerRating,
        league: getLeagueFromRating(newAttackerRating),
        attacks_today: newAttackCount,
        last_attack_at: new Date().toISOString(),
      })
      .eq('character_id', character.id)

    await supabase
      .from('characters')
      .update({
        pvp_wins: newWins,
        pvp_losses: newLosses,
        updated_at: new Date().toISOString(),
      })
      .eq('id', character.id)

    // Create PvP match record
    await supabase.from('pvp_matches').insert({
      attacker_id: character.id,
      defender_id: defenderCharacterId,
      status: 'completed',
      battle_report_id: battleReport.id,
      league_points_change: eloChange,
      completed_at: new Date().toISOString(),
    })

    // Award XP and gold for win
    if (victory) {
      const newGold = character.gold + PVP_GOLD_REWARD
      const newExp = character.experience + PVP_XP_REWARD
      const newLevel = levelFromExperience(newExp)

      await supabase
        .from('characters')
        .update({
          gold: newGold,
          experience: newExp,
          ...(newLevel > character.level ? { level: newLevel } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', character.id)

      await supabase.from('currency_ledger').insert({
        character_id: character.id,
        currency_type: 'gold',
        balance_before: character.gold,
        change_amount: PVP_GOLD_REWARD,
        balance_after: newGold,
        reason: 'PvP victory reward',
        source_type: 'pvp_reward',
        source_id: battleReport.id,
        idempotency_key: `pvp_gold_${battleReport.id}`,
      })
    }

    return {
      success: true,
      data: {
        victory,
        ratingChange: eloChange,
        newRating: newAttackerRating,
        rounds: battleResult.rounds,
        xpReward: victory ? PVP_XP_REWARD : 0,
        goldReward: victory ? PVP_GOLD_REWARD : 0,
        battleReportId: battleReport.id,
      },
    }
  } catch (error) {
    console.error('Attack opponent error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getBattleReports(type: 'pve' | 'pvp', page: number = 1) {
  try {
    const validated = getBattleReportsSchema.safeParse({ type, page })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const pageSize = 10
    const offset = (page - 1) * pageSize

    const { data: reports, error: reportsError, count } = await supabase
      .from('battle_reports')
      .select(`
        *,
        attacker:characters!attacker_id (name, level, pvp_rating),
        defender:characters!defender_id (name, level, pvp_rating)
      `, { count: 'exact' })
      .eq('battle_type', type)
      .or(`attacker_id.eq.${character.id},defender_id.eq.${character.id}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (reportsError) return { success: false, error: 'Failed to fetch battle reports' }

    return {
      success: true,
      data: {
        reports: reports || [],
        pagination: {
          page,
          pageSize,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      },
    }
  } catch (error) {
    console.error('Get battle reports error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getBattleReport(reportId: string) {
  try {
    const validated = getBattleReportSchema.safeParse({ reportId })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!character) return { success: false, error: 'Character not found' }

    const { data: report, error: reportError } = await supabase
      .from('battle_reports')
      .select(`
        *,
        attacker:characters!attacker_id (name, level, pvp_rating, faction_id, factions (name)),
        defender:characters!defender_id (name, level, pvp_rating, faction_id, factions (name))
      `)
      .eq('id', reportId)
      .or(`attacker_id.eq.${character.id},defender_id.eq.${character.id}`)
      .maybeSingle()

    if (reportError || !report) return { success: false, error: 'Battle report not found' }

    return { success: true, data: { report } }
  } catch (error) {
    console.error('Get battle report error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getMyRating() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!character) return { success: false, error: 'Character not found' }

    const { data: rating } = await supabase
      .from('pvp_ratings')
      .select('*')
      .eq('character_id', character.id)
      .maybeSingle()

    if (!rating) {
      return {
        success: true,
        data: {
          rating: 1000,
          league: 'tieň',
          seasonPoints: 0,
          attacksToday: 0,
        },
      }
    }

    return {
      success: true,
      data: {
        rating: rating.rating,
        league: rating.league,
        seasonPoints: rating.season_points,
        attacksToday: rating.attacks_today,
        lastAttackAt: rating.last_attack_at,
      },
    }
  } catch (error) {
    console.error('Get my rating error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
