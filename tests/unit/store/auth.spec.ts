import { Store } from 'vuex'
import { expect } from 'chai'
import { logIn, createTestStore } from '../utils'
import { mockServer } from '../setup'
import { AuthState, RootState } from '@/store/types'

describe('Vuex: auth', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
  })

  context('getters', () => {
    describe('#currentUsername', () => {
      it('returns the current username', () => {
        logIn(store)
        expect(store.getters.currentUsername).to.eql('72nd')
      })

      it('returns null if logged out', () => {
        expect(store.getters.currentUsername).to.be.null
      })
    })
  })

  context('actions', () => {
    describe('#logIn', () => {
      it('logs a user in', async () => {
        await mockServer.post('/login.json').thenReply(
          200,
          '{"success":true}',
          { Authorization: 'Bearer foobar' }
        )

        const result = await store.dispatch(
          'logIn',
          { username: 'test', password: 'user', rememberMe: 'false' }
        )

        expect(result.ok).to.be.true
        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.eql('foobar')
      })

      it('handles a 401', async () => {
        await mockServer.post('/login.json').thenReply(
          401,
          '{"success":false}'
        )

        const result = await store.dispatch(
          'logIn',
          { username: 'test', password: 'user', rememberMe: 'false' }
        )

        expect(result.ok).to.be.false
        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.be.null
      })
    })

    describe('#logOut', () => {
      it('logs out and removes the JWT', async () => {
        await mockServer.delete('/logout.json').thenReply(
          200,
          '{"success":true}'
        )

        await store.dispatch('logOut')
        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.be.null
      })
    })
  })
})
