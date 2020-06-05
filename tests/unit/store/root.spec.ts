import { Store } from 'vuex'
import { expect } from 'chai'
import { createTestStore } from '../utils'
import squadronJSON from '../../fixtures/squadron.txt.json'
import { mockServer } from '../setup'
import { RootState } from '@/store/types'

describe('Vuex', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
  })

  describe('#loadSquadron', () => {
    it('loads a squadron', async () => {
      await mockServer.get('/squadrons/72nd.json').thenReply(200, squadronJSON)
      await store.dispatch('loadSquadron', { username: '72nd' })

      expect(store.state.squadron?.name).to.eql('72nd VFW')
      expect(store.state.squadronLoading).to.be.false
      expect(store.state.squadronError).to.be.null
    })

    it('resets the stored squadron', async () => {
      await store.dispatch('loadSquadron', { username: null })

      expect(store.state.squadron).to.be.null
      expect(store.state.squadronLoading).to.be.false
      expect(store.state.squadronError).to.be.null
    })

    it('handles errors', async () => {
      await mockServer.get('/squadrons/72nd.json').thenReply(404, '{"error":"not found"}')
      await store.dispatch('loadSquadron', { username: '72nd' })

      expect(store.state.squadron).to.be.null
      expect(store.state.squadronLoading).to.be.false
      expect(store.state.squadronError?.message).to.eql('Invalid HTTP response: 404')
    })
  })
})
