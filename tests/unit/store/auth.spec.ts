import { Store } from 'vuex'
import { expect } from 'chai'
import nock from 'nock'
import { logIn, createTestStore } from '../utils'
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
        const scope = nock('http://localhost:5100')
          .post('/login.json')
          .reply(200, { success: true }, { Authorization: 'Bearer foobar' })

        const result = await store.dispatch(
          'logIn',
          { username: 'test', password: 'user', rememberMe: 'false' }
        )

        expect(result.ok).to.be.true
        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.eql('foobar')
        expect(scope.isDone()).to.be.true
      })

      it('handles a 401', async () => {
        const scope = nock('http://localhost:5100')
          .post('/login.json')
          .reply(401, { success: false })

        const result = await store.dispatch(
          'logIn',
          { username: 'test', password: 'user', rememberMe: 'false' }
        )

        expect(result.ok).to.be.false
        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.be.null
        expect(scope.isDone()).to.be.true
      })
    })

    describe('#logOut', () => {
      it('logs out and removes the JWT', async () => {
        const scope = nock('http://localhost:5100')
          .delete('/logout.json')
          .reply(200, { success: true })

        await store.dispatch('logOut')

        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.be.null
        expect(scope.isDone()).to.be.true
      })
    })
  })
})
