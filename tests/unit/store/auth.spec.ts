import { Store } from 'vuex'
import { expect } from 'chai'
import { http, HttpResponse } from 'msw'
import { logIn, createTestStore } from '../utils'
import backend from '../backend'
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
        const result = await store.dispatch(
          'logIn',
          { username: 'test', password: 'user', rememberMe: 'false' }
        )

        expect(result.ok).to.be.true
        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.eql('foobar')
      })

      it('handles a 401', async () => {
        backend.use(
          http.post('http://localhost:5100/login.json', () => HttpResponse.json(
            { success: false },
            { status: 401 }
          ))
        )

        const result = await store.dispatch(
          'logIn',
          { username: 'test', password: 'wrong', rememberMe: 'false' }
        )

        expect(result.ok).to.be.false
        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.be.null
      })
    })

    describe('#logOut', () => {
      it('logs out and removes the JWT', async () => {
        await store.dispatch('logOut')
        expect((<RootState & { auth: AuthState }>store.state).auth.JWT).to.be.null
      })
    })
  })
})
