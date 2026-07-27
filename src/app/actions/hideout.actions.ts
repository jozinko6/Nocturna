'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { buildings as buildingConfigs, getBuildingById } from '@/lib/config/hideout'

type BuildingType = 'main_hall' | 'training_chamber' | 'vault' | 'workshop' | 'guard_tower'

const startUpgradeSchema = z.object({
  buildingType: z.enum(['main_hall', 'training_chamber', 'vault', 'workshop', 'guard_tower']),
})

const completeUpgradeSchema = z.object({
  buildingType: z.enum(['main_hall', 'training_chamber', 'vault', 'workshop', 'guard_tower']),
})

const BUILDING_TYPE_TO_CONFIG: Record<BuildingType, string> = {
  main_hall: 'b_main_hall',
  training_chamber: 'b_training',
  vault: 'b_vault',
  workshop: 'b_forge',
  guard_tower: 'b_watchtower',
}

const CONFIG_ID_TO_BUILDING_TYPE: Record<string, BuildingType> = {
  b_main_hall: 'main_hall',
  b_training: 'training_chamber',
  b_vault: 'vault',
  b_forge: 'workshop',
  b_watchtower: 'guard_tower',
}

export async function getHideout() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const { data: existingHideout } = await supabase
      .from('hideouts')
      .select('id')
      .eq('character_id', character.id)
      .maybeSingle()

    let hideoutId: string

    if (!existingHideout) {
      const { data: newHideout, error: createError } = await supabase
        .from('hideouts')
        .insert({
          character_id: character.id,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (createError || !newHideout) {
        console.error('Hideout creation error:', createError)
        return { success: false, error: 'Failed to create hideout' }
      }

      hideoutId = newHideout.id

      const buildingInserts = buildingConfigs.map(cfg => ({
        hideout_id: hideoutId,
        building_type: CONFIG_ID_TO_BUILDING_TYPE[cfg.id],
        level: 1,
        upgrading: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: buildingsError } = await supabase
        .from('hideout_buildings')
        .insert(buildingInserts)

      if (buildingsError) {
        console.error('Buildings creation error:', buildingsError)
        return { success: false, error: 'Failed to create buildings' }
      }
    } else {
      hideoutId = existingHideout.id
    }

    const { data: dbBuildings } = await supabase
      .from('hideout_buildings')
      .select('*')
      .eq('hideout_id', hideoutId)
      .order('building_type', { ascending: true })

    const enrichedBuildings = (dbBuildings || []).map(db => {
      const bt = db.building_type as BuildingType
      const configId = BUILDING_TYPE_TO_CONFIG[bt]
      const config = getBuildingById(configId)
      const currentLevel = db.level
      const nextLevelConfig = config?.levels.find(l => l.level === currentLevel + 1)
      const currentLevelConfig = config?.levels.find(l => l.level === currentLevel) || config?.levels[0]

      return {
        buildingType: bt,
        name: config?.name ?? bt,
        description: config?.description ?? '',
        level: db.level,
        maxLevel: config?.maxLevel ?? 5,
        upgrading: db.upgrading,
        upgradeEndsAt: db.upgrade_ends_at,
        currentBonuses: currentLevelConfig?.bonuses ?? {},
        nextLevel: nextLevelConfig
          ? {
              goldCost: nextLevelConfig.goldCost,
              buildTimeSeconds: nextLevelConfig.buildTimeSeconds,
              bonusDescription: nextLevelConfig.bonusDescription,
              bonuses: nextLevelConfig.bonuses,
            }
          : null,
      }
    })

    return {
      success: true,
      data: {
        hideoutId,
        buildings: enrichedBuildings,
      },
    }
  } catch (error) {
    console.error('Get hideout error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function startUpgrade(buildingType: string) {
  try {
    const validated = startUpgradeSchema.safeParse({ buildingType })
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { success: false, error: 'Not authenticated' }

    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('id, gold')
      .eq('user_id', user.id)
      .single()
    if (charError || !character) return { success: false, error: 'Character not found' }

    const { data: hideout } = await supabase
      .from('hideouts')
      .select('id')
      .eq('character_id', character.id)
      .single()
    if (!hideout) return { success: false, error: 'Hideout not found' }

    const { data: building, error: buildingError } = await supabase
      .from('hideout_buildings')
      .select('*')
      .eq('hideout_id', hideout.id)
      .eq('building_type', buildingType)
      .single()
    if (buildingError || !building) return { success: false, error: 'Building not found' }

    if (building.upgrading) {
      return { success: false, error: 'Building is already upgrading' }
    }

    const configId = BUILDING_TYPE_TO_CONFIG[buildingType as BuildingType]
    const config = getBuildingById(configId)
    if (!config) return { success: false, error: 'Invalid building type' }

    const nextLevel = building.level + 1
    if (nextLevel > config.maxLevel) {
      return { success: false, error: 'Building is at maximum level' }
    }

    const nextLevelConfig = config.levels.find(l => l.level === nextLevel)
    if (!nextLevelConfig) return { success: false, error: 'Invalid upgrade level' }

    if (character.gold < nextLevelConfig.goldCost) {
      return { success: false, error: `Insufficient gold. Required: ${nextLevelConfig.goldCost}, Available: ${character.gold}` }
    }

    if (nextLevelConfig.buildTimeSeconds === 0) {
      const now = new Date().toISOString()
      const { error: updateError } = await supabase
        .from('hideout_buildings')
        .update({ level: nextLevel, updated_at: now })
        .eq('id', building.id)

      if (updateError) {
        console.error('Building instant upgrade error:', updateError)
        return { success: false, error: 'Failed to upgrade building' }
      }

      const newGold = character.gold - nextLevelConfig.goldCost
      await supabase
        .from('characters')
        .update({ gold: newGold, updated_at: now })
        .eq('id', character.id)

      await supabase
        .from('currency_ledger')
        .insert({
          character_id: character.id,
          currency_type: 'gold',
          balance_before: character.gold,
          change_amount: -nextLevelConfig.goldCost,
          balance_after: newGold,
          reason: `Upgraded ${config.name} to level ${nextLevel}`,
          source_type: 'building_upgrade',
          idempotency_key: `upgrade_${character.id}_${buildingType}_${now}`,
          created_at: now,
        })

      return {
        success: true,
        data: {
          buildingType,
          buildingName: config.name,
          previousLevel: building.level,
          newLevel: nextLevel,
          cost: nextLevelConfig.goldCost,
          duration: 0,
          endTime: now,
          instant: true,
        },
      }
    }

    const endTime = new Date(Date.now() + nextLevelConfig.buildTimeSeconds * 1000)
    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('hideout_buildings')
      .update({
        upgrading: true,
        upgrade_ends_at: endTime.toISOString(),
        updated_at: now,
      })
      .eq('id', building.id)

    if (updateError) {
      console.error('Building update error:', updateError)
      return { success: false, error: 'Failed to start upgrade' }
    }

    const newGold = character.gold - nextLevelConfig.goldCost
    await supabase
      .from('characters')
      .update({ gold: newGold, updated_at: now })
      .eq('id', character.id)

    await supabase
      .from('currency_ledger')
      .insert({
        character_id: character.id,
        currency_type: 'gold',
        balance_before: character.gold,
        change_amount: -nextLevelConfig.goldCost,
        balance_after: newGold,
        reason: `Upgrade started: ${config.name} to level ${nextLevel}`,
        source_type: 'building_upgrade',
        idempotency_key: `upgrade_${character.id}_${buildingType}_${now}`,
        created_at: now,
      })

    return {
      success: true,
      data: {
        buildingType,
        buildingName: config.name,
        previousLevel: building.level,
        newLevel: nextLevel,
        cost: nextLevelConfig.goldCost,
        duration: nextLevelConfig.buildTimeSeconds,
        endTime: endTime.toISOString(),
        instant: false,
      },
    }
  } catch (error) {
    console.error('Start upgrade error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function completeUpgrade(buildingType: string) {
  try {
    const validated = completeUpgradeSchema.safeParse({ buildingType })
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

    const { data: hideout } = await supabase
      .from('hideouts')
      .select('id')
      .eq('character_id', character.id)
      .single()
    if (!hideout) return { success: false, error: 'Hideout not found' }

    const { data: building, error: buildingError } = await supabase
      .from('hideout_buildings')
      .select('*')
      .eq('hideout_id', hideout.id)
      .eq('building_type', buildingType)
      .single()
    if (buildingError || !building) return { success: false, error: 'Building not found' }

    if (!building.upgrading || !building.upgrade_ends_at) {
      return { success: false, error: 'No upgrade in progress' }
    }

    const endTime = new Date(building.upgrade_ends_at)
    if (endTime > new Date()) {
      return { success: false, error: 'Upgrade not yet complete' }
    }

    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('hideout_buildings')
      .update({
        level: building.level + 1,
        upgrading: false,
        upgrade_ends_at: null,
        updated_at: now,
      })
      .eq('id', building.id)

    if (updateError) {
      console.error('Building level update error:', updateError)
      return { success: false, error: 'Failed to complete upgrade' }
    }

    const configId = BUILDING_TYPE_TO_CONFIG[buildingType as BuildingType]
    const config = getBuildingById(configId)
    const newLevelConfig = config?.levels.find(l => l.level === building.level + 1)

    return {
      success: true,
      data: {
        buildingType,
        buildingName: config?.name ?? buildingType,
        previousLevel: building.level,
        newLevel: building.level + 1,
        bonuses: newLevelConfig?.bonuses ?? {},
        bonusDescription: newLevelConfig?.bonusDescription ?? '',
      },
    }
  } catch (error) {
    console.error('Complete upgrade error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
