import { Store } from 'vuex'
import { expect } from 'chai'
import { DateTime } from 'luxon'
import squadronJSON from '../../fixtures/squadron.txt.json'
import { logIn, createTestStore } from '../utils'
import { mockServer } from '../setup'
import { MySquadronState, RootState } from '@/store/types'

describe('Vuex: mySquadron', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    logIn(store)
  })

  describe('#loadMySquadron', () => {
    it("loads the user's squadron", async () => {
      await mockServer.get('/squadrons/72nd.json').thenReply(200, squadronJSON)
      await store.dispatch('loadMySquadron')

      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron
      expect(state.mySquadron?.ID).to.eql(1)
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError).to.be.null
    })

    it('handles errors', async () => {
      await mockServer.get('/squadrons/72nd.json').thenReply(422, '{"error":"oops"}')
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
      await mockServer.put('/squadron.json').thenReply(200, squadronJSON)
      await store.dispatch('updateMySquadron', { body: new FormData() })

      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron
      expect(state.mySquadron?.name).to.eql('72nd VFW')
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError).to.be.null
    })

    it('handles validation errors', async () => {
      await mockServer.put('/squadron.json').thenReply(
        422,
        JSON.stringify({ errors: { name: ['must be present'] } })
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
      await mockServer.put('/squadron.json').thenReply(500, '{"error":"oops"}')
      try {
        await store.dispatch('updateMySquadron', { body: new FormData() })
        // eslint-disable-next-line no-empty
      } catch (error) {}

      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError?.message).to.eql('Invalid HTTP response: 500')
    })
  })
})
