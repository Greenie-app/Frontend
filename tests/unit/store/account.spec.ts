import {
  describe, it, beforeEach, expect
} from 'vitest'
import { createTestPinia } from '../utils'
import { useAccountStore } from '@/stores/account'
import { useAuthStore } from '@/stores/auth'

describe('Pinia: account', () => {
  let accountStore: ReturnType<typeof useAccountStore>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    createTestPinia()
    accountStore = useAccountStore()
    authStore = useAuthStore()
  })

  describe('#signUp', () => {
    it('sets the JWT', async () => {
      await accountStore.signUp({ body: new FormData() })
      expect(authStore.JWT).toEqual('foobar')
    })
  })
})
