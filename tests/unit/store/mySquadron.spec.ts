import {
  describe, it, beforeEach, expect
} from 'vitest'
import { DateTime } from 'luxon'
import { http, HttpResponse } from 'msw'
import { logIn, createTestPinia } from '../utils'
import backend from '../backend'
import { useMySquadronStore } from '@/stores/mySquadron'

describe('Pinia: mySquadron', () => {
  let mySquadronStore: ReturnType<typeof useMySquadronStore>

  beforeEach(() => {
    createTestPinia()
    mySquadronStore = useMySquadronStore()
    logIn()
  })

  describe('#loadMySquadron', () => {
    it("loads the user's squadron", async () => {
      await mySquadronStore.loadMySquadron()

      expect(mySquadronStore.mySquadron?.ID).toEqual(1)
      expect(mySquadronStore.mySquadronLoading).toBe(false)
      expect(mySquadronStore.mySquadronError).toBeNull()
    })

    it('handles errors', async () => {
      backend.use(
        http.get('http://localhost:5100/squadrons/72nd.json', () =>
          HttpResponse.json({ error: 'oops' }, { status: 422 }))
      )

      await mySquadronStore.loadMySquadron()

      expect(mySquadronStore.mySquadronLoading).toBe(false)
      expect(mySquadronStore.mySquadronError?.message).toEqual('Invalid HTTP response: 422')
    })
  })

  describe('#updateMySquadron', () => {
    beforeEach(async () => {
      // Set initial squadron state by calling initialize
      mySquadronStore.initialize({
        mySquadron: {
          ID: 1,
          name: 'OldName',
          username: 'old',
          email: 'tim@example.com',
          createdAt: DateTime.utc(),
          updatedAt: DateTime.utc(),
          unknownPassCount: 7,
          image: null,
          isEditable: true
        }
      })
    })

    it("updates the user's squadron", async () => {
      await mySquadronStore.updateMySquadron({ body: new FormData() })

      expect(mySquadronStore.mySquadron?.name).toEqual('72nd VFW')
      expect(mySquadronStore.mySquadronLoading).toBe(false)
      expect(mySquadronStore.mySquadronError).toBeNull()
    })

    it('handles validation errors', async () => {
      backend.use(
        http.put('http://localhost:5100/squadron.json', () =>
          HttpResponse.json({ errors: { name: ['must be present'] } }, { status: 422 }))
      )

      const result = await mySquadronStore.updateMySquadron({ body: new FormData() })

      expect(mySquadronStore.mySquadronLoading).toBe(false)
      expect(mySquadronStore.mySquadronError).toBeNull()
      expect(mySquadronStore.mySquadron?.name).toEqual('OldName')

      expect(result.ok).toBe(false)
      expect(result.val).toEqual({ name: ['must be present'] })
    })

    it('handles other errors', async () => {
      backend.use(
        http.put('http://localhost:5100/squadron.json', () =>
          HttpResponse.json({ error: 'oops' }, { status: 500 }))
      )

      try {
        await mySquadronStore.updateMySquadron({ body: new FormData() })
         
      } catch {}

      expect(mySquadronStore.mySquadronLoading).toBe(false)
      expect(mySquadronStore.mySquadronError?.message).toEqual('Invalid HTTP response: 500')
    })
  })
})
