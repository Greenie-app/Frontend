/* eslint-disable no-shadow */

import {
  ActionTree, GetterTree, Module, MutationTree
} from 'vuex'
import { assign, isNull } from 'lodash-es'
import * as queryString from 'query-string'
import { Result } from 'ts-results'
import * as ActionCable from 'actioncable'
import { AuthState, RootState } from '@/store/types'
import secrets from '@/config/secrets'
import {
  ignoreResponseBodyOrReturnError,
  ignoreResponseBodyOrThrowError
} from '@/store/utils'


interface JWTPayload {
  iss: string;
  sub: string;
  aud: string;
  exp?: string | number;
  nbf?: string | number;
  iat: string | number;
  jti: string;

  u: string;
}

export function state(): AuthState {
  return {
    JWT: null
  }
}

const getters: GetterTree<AuthState, RootState> = {
  JWT(state): string | null {
    return state.JWT
  },
  JWTPayload(state): JWTPayload | null {
    return state.JWT ? JSON.parse(atob(state.JWT.split('.')[1])) : null
  },

  /** @return Whether a squadron is logged in for this session. */
  loggedIn(state): boolean {
    return !isNull(state.JWT)
  },

  /** The username of the Squadron that's logged in, if any. */
  currentUsername(state, getters): string | null {
    const payload: JWTPayload | null = getters.JWTPayload
    if (isNull(payload)) return null
    return payload.u
  },

  actionCableConsumer(state): ActionCable.Cable | null {
    if (isNull(state.JWT)) return null
    const URL = `${secrets.actionCableURL}?${queryString.stringify({ jwt: state.JWT })}`
    return ActionCable.createConsumer(URL)
  },

  authHeader(state): string | null {
    if (state.JWT) return `Bearer ${state.JWT}`
    return null
  },

  freezeAuth(state): AuthState {
    return state
  }
}

const mutations: MutationTree<AuthState> = {
  INITIALIZE_AUTH(state, { storedState }: { storedState: AuthState }) {
    state.JWT = storedState.JWT
  },

  RESET_AUTH(state_) {
    assign(state_, state())
  },

  SET_JWT(state, { JWT }: { JWT: string | null }) {
    state.JWT = JWT
  }
}

const actions: ActionTree<AuthState, RootState> = {

  /**
   * Logs in a squadron account.
   *
   * @param username The squadron username.
   * @param password The password.
   * @param rememberMe If true, sets a remember-me token.
   * @return A Result containing nothing if successful, or an error message if failed.
   */

  async logIn(
    { dispatch },
    { username, password, rememberMe }: { username: string; password: string; rememberMe: boolean }
  ): Promise<Result<void, string>> {
    const response = await dispatch('request', {
      path: '/login.json',
      method: 'post',
      body: { squadron: { username, password, remember_me: rememberMe } },
      skipResetAuth: true
    })

    const responseResult = await ignoreResponseBodyOrReturnError(response, [422, 401])
    if (responseResult.ok) await dispatch('setJWT', { response })
    return responseResult
  },

  setJWT({ commit }, { response }: { response: Response }): void {
    const authorization = response.headers.get('Authorization')
    if (authorization && authorization.match(/^Bearer /)) {
      commit('SET_JWT', { JWT: authorization.slice(7) })
    }
  },

  /**
   * Logs out the logged-in squadron user.
   */

  async logOut({ commit, dispatch }): Promise<void> {
    const result = await dispatch('request', { method: 'delete', path: '/logout.json' })
    await ignoreResponseBodyOrThrowError(result)
    commit('SET_JWT', { JWT: null })
  }
}

const auth: Module<AuthState, RootState> = {
  state, getters, mutations, actions
}
export default auth
