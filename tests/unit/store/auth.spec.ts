import {
  describe, it, beforeEach, expect
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { logIn, createTestPinia } from '../utils'
import backend from '../backend'
import { useAuthStore } from '@/stores/auth'

describe('Pinia: auth', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    createTestPinia()
    authStore = useAuthStore()
  })

  describe('getters', () => {
    describe('#currentUsername', () => {
      it('returns the current username', () => {
        logIn()
        expect(authStore.currentUsername).toEqual('72nd')
      })

      it('returns null if logged out', () => {
        expect(authStore.currentUsername).toBeNull()
      })
    })
  })

  describe('actions', () => {
    describe('#logIn', () => {
      it('logs a user in', async () => {
        const result = await authStore.logIn({
          username: 'test',
          password: 'user',
          rememberMe: false
        })

        expect(result.ok).toBe(true)
        expect(authStore.JWT).toEqual('foobar')
      })

      it('handles a 401', async () => {
        backend.use(
          http.post('http://localhost:5100/login.json', () => HttpResponse.json(
            { success: false },
            { status: 401 }
          ))
        )

        const result = await authStore.logIn({
          username: 'test',
          password: 'wrong',
          rememberMe: false
        })

        expect(result.ok).toBe(false)
        expect(authStore.JWT).toBeNull()
      })
    })

    describe('#logOut', () => {
      it('logs out and removes the JWT', async () => {
        await authStore.logOut()
        expect(authStore.JWT).toBeNull()
      })
    })
  })
})
