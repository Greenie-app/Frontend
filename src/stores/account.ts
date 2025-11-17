import { defineStore } from 'pinia'
import { Ok, Result } from 'ts-results'
import { useRootStore } from './root'
import { useAuthStore } from './auth'
import type { Errors } from '@/stores/types'
import { squadronFromJSON, type SquadronJSONDown } from '@/stores/coding'
import {
  ignoreResponseBodyOrReturnErrors,
  ignoreResponseBodyOrThrowError,
  loadResponseBodyOrReturnErrors,
} from '@/stores/utils'
import type { Squadron } from '@/types'

export const useAccountStore = defineStore('account', () => {
  const rootStore = useRootStore()
  const authStore = useAuthStore()

  /**
   * Creates a new squadron.
   * @param body The squadron attributes.
   * @return A Result containing either the created Squadron or the validation errors.
   */
  async function signUp({ body }: { body: FormData }): Promise<Result<Squadron, Errors>> {
    const result = await rootStore.requestJSON<SquadronJSONDown>({
      method: 'post',
      path: '/squadrons.json',
      body,
    })
    const signupBodyResult = await loadResponseBodyOrReturnErrors(result)
    if (!signupBodyResult.ok) return signupBodyResult

    // Set JWT from response
    if (result.ok) {
      const authorization = result.val.response.headers.get('Authorization')
      if (authorization && authorization.match(/^Bearer /)) {
        authStore.setJWT(authorization.slice(7))
      }
    }

    return new Ok(squadronFromJSON(signupBodyResult.val))
  }

  /**
   * Generates a reset-password email.
   *
   * @param email The squadron email address to send the reset-password link to.
   * @return A Result containing nothing if successful, or the validation errors if failed.
   */
  async function forgotPassword({ email }: { email: string }): Promise<Result<void, Errors>> {
    const response = await rootStore.request({
      method: 'post',
      path: '/forgot_password.json',
      body: { squadron: { email } },
    })
    return ignoreResponseBodyOrReturnErrors(response)
  }

  /**
   * Resets a squadron password using a token from a reset-password email.
   *
   * @param password The new squadron password.
   * @param confirmation The password confirmation.
   * @param token The token from the reset-password email.
   * @return A Result containing nothing if successful, or the validation errors if failed.
   */
  async function resetPassword({
    password,
    confirmation,
    token,
  }: {
    password: string
    confirmation: string
    token: string
  }): Promise<Result<void, Errors>> {
    const response = await rootStore.request({
      method: 'PATCH',
      path: '/forgot_password.json',
      body: {
        squadron: {
          password,
          password_confirmation: confirmation,
          reset_password_token: token,
        },
      },
    })
    return ignoreResponseBodyOrReturnErrors(response)
  }

  /**
   * Changes a Squadron's password.
   *
   * @param oldPassword The old squadron password.
   * @param newPassword The new squadron password.
   * @param confirmation The password confirmation.
   * @return A Result containing nothing if successful, or the validation errors if failed.
   */
  async function changePassword({
    oldPassword,
    newPassword,
    confirmation,
  }: {
    oldPassword: string
    newPassword: string
    confirmation: string
  }): Promise<Result<void, Errors>> {
    const response = await rootStore.request({
      method: 'PATCH',
      path: '/squadron/password.json',
      body: {
        squadron: {
          current_password: oldPassword,
          password: newPassword,
          password_confirmation: confirmation,
        },
      },
    })
    return ignoreResponseBodyOrReturnErrors(response)
  }

  /**
   * Deletes a Squadron.
   */
  async function deleteAccount(): Promise<void> {
    const result = await rootStore.requestJSON<void>({
      method: 'delete',
      path: '/squadron.json',
    })
    await ignoreResponseBodyOrThrowError(result)
    rootStore.resetSquadron()
    authStore.resetAuth()
  }

  return {
    signUp,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteAccount,
  }
})
