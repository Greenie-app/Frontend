import {
  describe, it, beforeEach, expect
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { createTestPinia } from '../utils'
import backend from '../backend'
import { usePilotsStore } from '@/stores/pilots'
import { usePassesStore } from '@/stores/passes'

describe('Pinia: pilots', () => {
  let pilotsStore: ReturnType<typeof usePilotsStore>
  let passesStore: ReturnType<typeof usePassesStore>

  beforeEach(async () => {
    createTestPinia()
    pilotsStore = usePilotsStore()
    passesStore = usePassesStore()

    // Load passes so the store has data
    await passesStore.loadPasses({ squadron: '72nd' })
  })

  describe('#renamePilot', () => {
    it('renames a pilot', async () => {
      const result = await pilotsStore.renamePilot({
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result.ok).toBe(true)
      // Note: The rename action doesn't automatically update passes in the store
      // In the real app, this would likely trigger a reload via ActionCable
    })

    it('handles validation errors', async () => {
      backend.use(
        http.put('http://localhost:5100/squadron/pilots/Stretch%20%7C%2055FS.json', () => HttpResponse.json(
          { errors: { name: ['must be present'] } },
          { status: 422 }
        ))
      )

      const result = await pilotsStore.renamePilot({
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result.ok).toBe(false)
      expect(result.val).toEqual({ name: ['must be present'] })
    })

    it('handles other errors', async () => {
      backend.use(
        http.put('http://localhost:5100/squadron/pilots/Stretch%20%7C%2055FS.json', () => HttpResponse.json(
          { error: true },
          { status: 500 }
        ))
      )

      const result = pilotsStore.renamePilot({
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      await expect(result).rejects.toThrow('Invalid HTTP response: 500')
    })
  })
})
