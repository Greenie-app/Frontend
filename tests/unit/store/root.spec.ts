import 'cross-fetch/polyfill'
import { Store } from 'vuex'
import { expect } from 'chai'
import nock from 'nock'
import { createTestStore } from '../utils'
import { RootState } from '@/store/types'

const squadronJSON = require('../../fixtures/squadron.json')

describe('Vuex', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
  })

  describe('#loadSquadron', () => {
    it('loads a squadron', async () => {
      const scope = nock('http://localhost:5100')
        .get('/squadrons/72nd.json')
        .reply(200, squadronJSON)

      await store.dispatch('loadSquadron', { username: '72nd' })

      expect(store.state.squadron?.name).to.eql('72nd VFW')
      expect(store.state.squadronLoading).to.be.false
      expect(store.state.squadronError).to.be.null
      expect(scope.isDone()).to.be.true
    })

    it('resets the stored squadron', async () => {
      await store.dispatch('loadSquadron', { username: null })

      expect(store.state.squadron).to.be.null
      expect(store.state.squadronLoading).to.be.false
      expect(store.state.squadronError).to.be.null
    })

    it('handles errors', async () => {
      const scope = nock('http://localhost:5100')
        .get('/squadrons/72nd.json')
        .reply(404, { error: 'not found' })

      await store.dispatch('loadSquadron', { username: '72nd' })

      expect(store.state.squadron).to.be.null
      expect(store.state.squadronLoading).to.be.false
      expect(store.state.squadronError?.message).to.eql('Invalid HTTP response: 404')
      expect(scope.isDone()).to.be.true
    })
  })
})
