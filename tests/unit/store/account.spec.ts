import { Store } from 'vuex'
import { expect } from 'chai'
import nock from 'nock'
import { createTestStore } from '../utils'
import { AuthState, RootState } from '@/store/types'

const squadronJSON = require('../../fixtures/squadron.json')

describe('Vuex: account', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
  })

  describe('#signUp', () => {
    it('sets the JWT', async () => {
      const scope = nock('http://localhost:5100')
        .post('/squadrons.json')
        .reply(200, squadronJSON, { Authorization: 'Bearer foobar' })

      await store.dispatch('signUp', { body: new FormData() })

      expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.eql('foobar')
      expect(scope.isDone()).to.be.true
    })
  })
})
