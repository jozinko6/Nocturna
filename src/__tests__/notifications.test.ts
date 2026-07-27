import { describe, it, expect } from 'vitest'
import {
  createNotificationPayload,
  buildNotificationRows,
} from '../game/notifications'

describe('Notifications', () => {
  describe('createNotificationPayload', () => {
    it('creates battle_report notification', () => {
      const payload = createNotificationPayload({
        type: 'battle_report',
        victory: true,
        enemyName: 'Prízrak',
        goldReward: 150,
        xpReward: 200,
        battleReportId: 'br-123',
      })
      expect(payload.type).toBe('battle_report')
      expect(payload.title).toContain('Výhra')
      expect(payload.message).toContain('Prízrak')
      expect(payload.data).toEqual({ battleReportId: 'br-123', victory: true })
    })

    it('creates quest_complete notification', () => {
      const payload = createNotificationPayload({
        type: 'quest_complete',
        missionId: 'm-1',
        questName: 'Nočný lovec',
      })
      expect(payload.type).toBe('quest_complete')
      expect(payload.title).toContain('splnená')
      expect(payload.message).toContain('Nočný lovec')
    })

    it('creates hideout_complete notification', () => {
      const payload = createNotificationPayload({
        type: 'hideout_complete',
        buildingName: 'Tréningová komora',
        newLevel: 3,
        buildingType: 'training_chamber',
      })
      expect(payload.type).toBe('hideout_complete')
      expect(payload.message).toContain('3')
    })

    it('creates pvp_result notification', () => {
      const payload = createNotificationPayload({
        type: 'pvp_result',
        victory: true,
        defenderName: 'Tieň',
        ratingChange: 25,
        matchId: 'pm-1',
      })
      expect(payload.type).toBe('pvp_result')
      expect(payload.title).toContain('Výhra')
    })

    it('creates system notification', () => {
      const payload = createNotificationPayload({
        type: 'system',
        title: 'Maintenance',
        message: 'Server bude nedostupný.',
      })
      expect(payload.type).toBe('system')
      expect(payload.title).toBe('Maintenance')
    })

    it('defaults to system type for unknown types', () => {
      const payload = createNotificationPayload({
        type: 'unknown_type',
        title: 'Test',
        message: 'Test',
      })
      expect(payload.type).toBe('system')
    })
  })

  describe('buildNotificationRows', () => {
    it('builds rows from notification data', () => {
      const rows = buildNotificationRows('char-1', [
        { type: 'system', title: 'Test', message: 'Hello' },
        { type: 'training', title: 'Training', message: 'Done', data: { attributeName: 'strength' } },
      ])
      expect(rows).toHaveLength(2)
      expect(rows[0].character_id).toBe('char-1')
      expect(rows[0].type).toBe('system')
      expect(rows[0].read).toBe(false)
      expect(rows[1].data).toContain('strength')
    })

    it('uses custom timestamp', () => {
      const ts = '2026-01-01T00:00:00.000Z'
      const rows = buildNotificationRows('char-1', [
        { type: 'system', title: 'Test', message: 'Hello' },
      ], ts)
      expect(rows[0].created_at).toBe(ts)
    })
  })
})
