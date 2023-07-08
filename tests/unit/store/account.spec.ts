import { Store } from 'vuex'
import { expect } from 'chai'
import { createTestStore } from '../utils'
import { AuthState, RootState } from '@/store/types'

describe('Vuex: account', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
  })

  describe('#signUp', () => {
    it('sets the JWT', async () => {
      await store.dispatch('signUp', { body: new FormData() })
      expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.eql('foobar')
    })
  })
})
