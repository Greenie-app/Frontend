import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import i18n from '@/i18n'

export function createTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

export function logIn(): void {
  const authStore = useAuthStore()
  // Use the setJWT method to set the JWT properly
  authStore.setJWT('eyJhbGciOiJIUzI1NiJ9.eyJ1IjoiNzJuZCIsInN1YiI6IjEiLCJzY3AiOiJzcXVhZHJvbiIsImF1ZCI6bnVsbCwiaWF0IjoxNTkxNzQ1NDc4LCJleHAiOjE1OTE4MzE4NzgsImp0aSI6ImM1YjBmOGEzLTYzMzQtNGI0NC1iYWEyLTIxMjU3MWZmMDA5NSJ9.fake-signature')
}

export { i18n }
