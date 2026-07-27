/**
 * Nocturna — Notification Helper
 *
 * Server-side utility for creating in-game notifications.
 * Notifications are used for: battle reports, daily quest completion,
 * hideout upgrades, PvP results, and system messages.
 */

export type NotificationType =
  | 'battle_report'
  | 'quest_complete'
  | 'quest_claim'
  | 'hideout_upgrade'
  | 'hideout_complete'
  | 'pvp_result'
  | 'daily_reward'
  | 'shop_purchase'
  | 'training'
  | 'expedition_complete'
  | 'system'
  | 'admin'

interface NotificationData {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
}

const NOTIFICATION_TEMPLATES: Record<NotificationType, (data: Record<string, unknown>) => NotificationData> = {
  battle_report: (d) => ({
    type: 'battle_report',
    title: d.victory ? 'Výhra v boji!' : 'Prehra v boji',
    message: d.victory
      ? `Porazil ${d.enemyName} a získal ${d.goldReward} zlata a ${d.xpReward} skúseností.`
      : `Bol porazený ${d.enemyName}.`,
    data: { battleReportId: d.battleReportId, victory: d.victory },
  }),

  quest_complete: (d) => ({
    type: 'quest_complete',
    title: 'Úloha splnená!',
    message: `Dokončil si úlohu "${d.questName}". Klikni pre odmenu.`,
    data: { missionId: d.missionId, questName: d.questName },
  }),

  quest_claim: (d) => ({
    type: 'quest_claim',
    title: 'Odmena prevzatá',
    message: `Získal ${d.goldReward} zlata a ${d.xpReward} XP za "${d.questName}".`,
    data: { missionId: d.missionId },
  }),

  hideout_upgrade: (d) => ({
    type: 'hideout_upgrade',
    title: 'Vylepšenie spustené',
    message: `${d.buildingName} sa vylepšuje na úroveň ${d.newLevel}. Hotové o ${d.timeRemaining}.`,
    data: { buildingType: d.buildingType, newLevel: d.newLevel },
  }),

  hideout_complete: (d) => ({
    type: 'hideout_complete',
    title: 'Vylepšenie dokončené!',
    message: `${d.buildingName} bola vylepšená na úroveň ${d.newLevel}.`,
    data: { buildingType: d.buildingType, newLevel: d.newLevel },
  }),

  pvp_result: (d) => ({
    type: 'pvp_result',
    title: d.victory ? 'PvP Výhra!' : 'PvP Prehra',
    message: d.victory
      ? `Porazil ${d.defenderName} v PvP. +${d.ratingChange} hodnotenia.`
      : `Prehral proti ${d.defenderName}. ${d.ratingChange} hodnotenia.`,
    data: { matchId: d.matchId, victory: d.victory, ratingChange: d.ratingChange },
  }),

  daily_reward: (d) => ({
    type: 'daily_reward',
    title: 'Denná odmena',
    message: `Deň ${d.streakDay}: ${d.goldReward} zlata${(d.crystalsReward as number) > 0 ? ` a ${d.crystalsReward} kryštálov` : ''}.`,
    data: { streakDay: d.streakDay },
  }),

  shop_purchase: (d) => ({
    type: 'shop_purchase',
    title: 'Nákup v obchode',
    message: `Kúpil ${d.itemName} za ${d.price} zlata.`,
    data: { itemId: d.itemId },
  }),

  training: (d) => ({
    type: 'training',
    title: 'Tréning dokončený',
    message: `${d.attributeName} zvýšený na úroveň ${d.newLevel}.`,
    data: { attributeName: d.attributeName, newLevel: d.newLevel },
  }),

  expedition_complete: (d) => ({
    type: 'expedition_complete',
    title: d.victory ? 'Výprava úspešná!' : 'Výprava neúspešná',
    message: d.victory
      ? `Výprava do ${d.regionName} bola úspešná. Získané odmeny.`
      : `Výprava do ${d.regionName} skončila neúspechom.`,
    data: { expeditionId: d.expeditionId, regionName: d.regionName },
  }),

  system: (d) => ({
    type: 'system',
    title: (d.title as string) || 'Systémová správa',
    message: (d.message as string) || '',
    data: d.data as Record<string, unknown> | undefined,
  }),

  admin: (d) => ({
    type: 'admin',
    title: (d.title as string) || 'Správa od administrátora',
    message: (d.message as string) || '',
    data: d.data as Record<string, unknown> | undefined,
  }),
}

/**
 * Create a notification using a template.
 */
export function createNotificationPayload(data: Record<string, unknown>): NotificationData {
  const type = (data.type as NotificationType) || 'system'
  const template = NOTIFICATION_TEMPLATES[type]
  return template ? template(data) : NOTIFICATION_TEMPLATES.system(data)
}

/**
 * Batch notification creation helper for server actions.
 * Returns an array of notification row objects ready for insertion.
 */
export function buildNotificationRows(
  characterId: string,
  notifications: NotificationData[],
  now: string = new Date().toISOString(),
) {
  return notifications.map(n => ({
    character_id: characterId,
    type: n.type,
    title: n.title,
    message: n.message,
    data: n.data ? JSON.stringify(n.data) : null,
    read: false,
    created_at: now,
  }))
}
