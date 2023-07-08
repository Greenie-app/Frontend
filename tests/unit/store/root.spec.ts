import { Store } from 'vuex'
import { expect } from 'chai'
import { http, HttpResponse } from 'msw'
import { createTestStore } from '../utils'
import backend from '../backend'
import { RootState } from '@/store/types'

describe('Vuex', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
  })

  describe('#loadSquadron', () => {
    it('loads a squadron', async () => {
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
      backend.use(
        http.get('http://localhost:5100/squadrons/72nd.json', () => HttpResponse.json(
          { error: 'not found' },
          { status: 404 }
        ))
      )

      await store.dispatch('loadSquadron', { username: '72nd' })

      expect(store.state.squadron).to.be.null
      expect(store.state.squadronLoading).to.be.false
      expect(store.state.squadronError?.message).to.eql('Invalid HTTP response: 404')
    })
  })
})
