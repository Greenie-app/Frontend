import { Store } from 'vuex'
import { expect } from 'chai'
import { DateTime } from 'luxon'
import nock from 'nock'
import { logIn, createTestStore } from '../utils'
import { MySquadronState, RootState } from '@/store/types'

const squadronJSON = require('../../fixtures/squadron.json')

describe('Vuex: mySquadron', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    logIn(store)
  })

  describe('#loadMySquadron', () => {
    it("loads the user's squadron", async () => {
      const scope = nock('http://localhost:5100')
        .get('/squadrons/72nd.json')
        .reply(200, squadronJSON)

      await store.dispatch('loadMySquadron')
      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron

      expect(state.mySquadron?.ID).to.eql(1)
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError).to.be.null
      expect(scope.isDone()).to.be.true
    })

    it('handles errors', async () => {
      const scope = nock('http://localhost:5100')
        .get('/squadrons/72nd.json')
        .reply(422, { error: 'oops' })

      await store.dispatch('loadMySquadron')
      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron

      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError?.message).to.eql('Invalid HTTP response: 422')
      expect(scope.isDone()).to.be.true
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
      const scope = nock('http://localhost:5100')
        .put('/squadron.json')
        .reply(200, squadronJSON)

      await store.dispatch('updateMySquadron', { body: new FormData() })
      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron

      expect(state.mySquadron?.name).to.eql('72nd VFW')
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError).to.be.null
      expect(scope.isDone()).to.be.true
    })

    it('handles validation errors', async () => {
      const scope = nock('http://localhost:5100')
        .put('/squadron.json')
        .reply(422, { errors: { name: ['must be present'] } })

      const result = await store.dispatch('updateMySquadron', { body: new FormData() })
      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron

      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError).to.be.null
      expect(state.mySquadron?.name).to.eql('OldName')

      expect(result.ok).to.be.false
      expect(result.val).to.eql({ name: ['must be present'] })

      expect(scope.isDone()).to.be.true
    })

    it('handles other errors', async () => {
      const scope = nock('http://localhost:5100')
        .put('/squadron.json')
        .reply(500, { error: 'oops' })

      try {
        await store.dispatch('updateMySquadron', { body: new FormData() })
        // eslint-disable-next-line no-empty
      } catch (error: unknown) {}

      const state = (<RootState & { mySquadron: MySquadronState }>store.state).mySquadron
      expect(state.mySquadronLoading).to.be.false
      expect(state.mySquadronError?.message).to.eql('Invalid HTTP response: 500')

      expect(scope.isDone()).to.be.true
    })
  })
})
