import {
  describe, it, beforeEach, expect
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { createTestPinia } from '../utils'
import backend from '../backend'
import { useRootStore } from '@/stores/root'

describe('Pinia: root', () => {
  let rootStore: ReturnType<typeof useRootStore>

  beforeEach(() => {
    createTestPinia()
    rootStore = useRootStore()
  })

  describe('#loadSquadron', () => {
    it('loads a squadron', async () => {
      await rootStore.loadSquadron({ username: '72nd' })

      expect(rootStore.squadron?.name).toEqual('72nd VFW')
      expect(rootStore.squadronLoading).toBe(false)
      expect(rootStore.squadronError).toBeNull()
    })

    it('resets the stored squadron', async () => {
      await rootStore.loadSquadron({ username: null })

      expect(rootStore.squadron).toBeNull()
      expect(rootStore.squadronLoading).toBe(false)
      expect(rootStore.squadronError).toBeNull()
    })

    it('handles errors', async () => {
      backend.use(
        http.get('http://localhost:5100/squadrons/72nd.json', () => HttpResponse.json(
          { error: 'not found' },
          { status: 404 }
        ))
      )

      await rootStore.loadSquadron({ username: '72nd' })

      expect(rootStore.squadron).toBeNull()
      expect(rootStore.squadronLoading).toBe(false)
      expect(rootStore.squadronError?.message).toEqual('Invalid HTTP response: 404')
    })
  })
})
