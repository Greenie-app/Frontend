/* eslint-disable camelcase */

import { ActionContext, ActionTree, Module } from 'vuex'
import { Ok, Result } from 'ts-results'
import { APIResponse, Errors, RootState } from '@/store/types'
import { squadronFromJSON, SquadronJSONDown } from '@/store/coding'
import {
  ignoreResponseBodyOrReturnErrors,
  ignoreResponseBodyOrThrowError,
  loadResponseBodyOrReturnErrors
} from '@/store/utils'
import { Squadron } from '@/types'

const actions: ActionTree<RootState, RootState> = {

  /**
   * Creates a new squadron.
   * @param body The squadron attributes.
   * @return A Result containing either the created Squadron or the validation errors.
   */

  async signUp(
    { dispatch }: ActionContext<RootState, RootState>,
    { body }: { body: FormData }
  ): Promise<Result<Squadron, Errors>> {
    const result: APIResponse<SquadronJSONDown> = await dispatch('requestJSON', {
      method: 'post',
      path: '/squadrons.json',
      body
    })
    const signupBodyResult = await loadResponseBodyOrReturnErrors(result)
    if (!signupBodyResult.ok) return signupBodyResult

    await dispatch('setJWT', { response: result.val.response })

    return new Ok(squadronFromJSON(signupBodyResult.val))
  },

  /**
   * Generates a reset-password email.
   *
   * @param email The squadron email address to send the reset-password link to.
   * @return A Result containing nothing if successful, or the validation errors if failed.
   */

  async forgotPassword(
    { dispatch }: ActionContext<RootState, RootState>,
    { email }: { email: string }
  ): Promise<Result<void, Errors>> {
    const response = await dispatch('request', {
      method: 'post',
      path: '/forgot_password.json',
      body: { squadron: { email } }
    })
    return ignoreResponseBodyOrReturnErrors(response)
  },

  /**
   * Resets a squadron password using a token from a reset-password email.
   *
   * @param password The new squadron password.
   * @param confirmation The password confirmation.
   * @param token The token from the reset-password email.
   * @return A Result containing nothing if successful, or the validation errors if failed.
   */

  async resetPassword(
    { dispatch }: ActionContext<RootState, RootState>,
    { password, confirmation, token }: { password: string; confirmation: string; token: string }
  ): Promise<Result<void, Errors>> {
    const response = await dispatch('request', {
      method: 'PATCH',
      path: '/forgot_password.json',
      body: {
        squadron: {
          password,
          password_confirmation: confirmation,
          reset_password_token: token
        }
      }
    })
    return ignoreResponseBodyOrReturnErrors(response)
  },

  /**
   * Changes a Squadron's password.
   *
   * @param oldPassword The old squadron password.
   * @param newPassword The new squadron password.
   * @param confirmation The password confirmation.
   * @return A Result containing nothing if successful, or the validation errors if failed.
   */

  async changePassword(
    { dispatch }: ActionContext<RootState, RootState>,
    { oldPassword, newPassword, confirmation }: {
      oldPassword: string;
      newPassword: string;
      confirmation: string;
    }
  ): Promise<Result<void, Errors>> {
    const response = await dispatch('request', {
      method: 'PATCH',
      path: '/squadron/password.json',
      body: {
        squadron: {
          current_password: oldPassword,
          password: newPassword,
          password_confirmation: confirmation
        }
      }
    })
    return ignoreResponseBodyOrReturnErrors(response)
  },

  /**
   * Deletes a Squadron.
   */

  async deleteAccount(
    { dispatch, commit }: ActionContext<RootState, RootState>
  ): Promise<void> {
    const result = await dispatch('request', {
      method: 'delete',
      path: '/squadron.json'
    })
    await ignoreResponseBodyOrThrowError(result)
    commit('RESET_SQUADRON')
    commit('RESET_AUTH')
  }
}

const account: Module<RootState, RootState> = { actions }
export default account
