import { Store } from 'vuex'
import { expect } from 'chai'
import { DateTime } from 'luxon'
import { http, HttpResponse } from 'msw'
import { logIn, createTestStore } from '../utils'
import backend from '../backend'
import { MySquadronState, RootState } from '@/store/types'

describe('Vuex: mySquadron', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    logIn(store)
  })

  describe('#loadMySquadron', () => {
    it("loads the user's squadron", async () => {
      await store.dispatch('loadMySquadron')
      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron

      expect(state.mySquadron?.ID).to.eql(1)
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError).to.be.null
    })

    it('handles errors', async () => {
      backend.use(
        http.get('http://localhost:5100/squadrons/72nd.json', () =>
          HttpResponse.json({ error: 'oops' }, { status: 422 }))
      )

      await store.dispatch('loadMySquadron')
      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron

      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError?.message).to.eql('Invalid HTTP response: 422')
    })
  })

  describe('#updateMySquadron', () => {
    beforeEach(() => {
      store.commit('FINISH_MY_SQUADRON', {
        squadron: {
          ID: 1,
          name: 'OldName',
          username: 'old',
          email: 'tim@example.com',
          createdAt: DateTime.utc(),
          updatedAt: DateTime.utc(),
          boardingRate: 0.5,
          unknownPassCount: 7,
          image: null
        }
      })
    })

    it("updates the user's squadron", async () => {
      await store.dispatch('updateMySquadron', { body: new FormData() })
      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron

      expect(state.mySquadron?.name).to.eql('72nd VFW')
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError).to.be.null
    })

    it('handles validation errors', async () => {
      backend.use(
        http.put('http://localhost:5100/squadron.json', () =>
          HttpResponse.json({ errors: { name: ['must be present'] } }, { status: 422 }))
      )

      const result = await store.dispatch('updateMySquadron', { body: new FormData() })
      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron

      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError).to.be.null
      expect(state.mySquadron?.name).to.eql('OldName')

      expect(result.ok).to.be.false
      expect(result.val).to.eql({ name: ['must be present'] })
    })

    it('handles other errors', async () => {
      backend.use(
        http.put('http://localhost:5100/squadron.json', () =>
          HttpResponse.json({ error: 'oops' }, { status: 500 }))
      )

      try {
        await store.dispatch('updateMySquadron', { body: new FormData() })
        // eslint-disable-next-line no-empty
      } catch {}

      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError?.message).to.eql('Invalid HTTP response: 500')
    })
  })
})
