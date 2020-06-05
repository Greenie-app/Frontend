import { Store } from 'vuex'
import { expect } from 'chai'
import squadronJSON from '../../fixtures/squadron.txt.json'
import { createTestStore } from '../utils'
import { mockServer } from '../setup'
import { AuthState, RootState } from '@/store/types'

describe('Vuex: account', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    mockServer.post('/squadrons.json').thenReply(200, squadronJSON, { Authorization: 'Bearer foobar' })
  })

  describe('#signUp', () => {
    it('sets the JWT', async () => {
      await store.dispatch('signUp', { body: new FormData() })
      expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.eql('foobar')
    })
  })
})
