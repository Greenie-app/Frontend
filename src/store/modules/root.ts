/* eslint-disable no-shadow */

import {
  ActionContext, ActionTree, GetterTree, MutationTree, StoreOptions
} from 'vuex'
import { has, isNull, isString } from 'lodash-es'
import { Err, Ok } from 'ts-results'
import Bugsnag from '@bugsnag/js'
import { APIResponse, RootState } from '@/store/types'
import { Squadron } from '@/types'
import secrets from '@/config/secrets'
import { squadronFromJSON, SquadronJSONDown } from '@/store/coding'
import { FROZEN_MODULES, loadResponseBodyOrThrowError } from '@/store/utils'

export function state(): RootState {
  return {
    squadron: null,
    squadronLoading: false,
    squadronError: null
  }
}

const getters: GetterTree<RootState, RootState> = {
  /** @return The Squadron for the current location. */
  squadron(state): Squadron | null {
    return state.squadronLoading || state.squadronError ? null : state.squadron
  },

  /** @return Whether the Squadron for the current location is loading. */
  squadronLoading(state): boolean {
    return state.squadronLoading
  },

  /** @return Any errors that occurred while loading the Squadron for the current location. */
  squadronError(state): Error | null {
    return state.squadronError
  },

  /** @return True if the Squadron for the current location has loaded. */
  squadronLoaded(state): boolean {
    return !isNull(state.squadron) && isNull(state.squadronError) && !state.squadronLoading
  },

  /** @return The number of Passes not associated with a pilot. */
  unknownPassCount(state): number {
    if (isNull(state.squadron)) return 0
    return state.squadron.unknownPassCount
  }
}

const mutations: MutationTree<RootState> = {
  START_SQUADRON(state): void {
    state.squadronLoading = true
    state.squadronError = null
  },

  FINISH_SQUADRON(state, { squadron }: { squadron: Squadron | null }): void {
    state.squadron = squadron
    state.squadronLoading = false
  },

  SET_SQUADRON_ERROR(state, { error }: { error: Error }): void {
    state.squadronError = error
    state.squadronLoading = false
  },

  RESET_SQUADRON(state) {
    state.squadron = null
    state.squadronLoading = false
    state.squadronError = null
  },

  UPDATE_SQUADRON_FROM_SUBSCRIPTION(state, { squadron }: { squadron: SquadronJSONDown }) {
    if (!state.squadronLoading && !state.squadronError && !isNull(state.squadron)
      && squadron.id === state.squadron.ID) {
      state.squadron = squadronFromJSON(squadron)
    }
  }
}

const actions: ActionTree<RootState, RootState> = {
  initialize({ commit }: ActionContext<RootState, RootState>): void {
    const storedStateJSON = localStorage.getItem('store')
    if (!isNull(storedStateJSON)) {
      const storedState = JSON.parse(storedStateJSON)
      FROZEN_MODULES.forEach(mod => {
        if (has(storedState, mod)) {
          commit(`INITIALIZE_${mod.toUpperCase()}`, { storedState: storedState[mod] })
        }
      })
    }
  },

  request(
    { commit, getters }: ActionContext<RootState, RootState>,
    {
      method, path, body, skipResetAuth
    }: {
      method?: string;
      path: string;
      body?: Record<string, unknown> | FormData | string;
      skipResetAuth?: boolean;
    }
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      let serializedBody: FormData | string
      if (!(body instanceof FormData) && !isString(body)) serializedBody = JSON.stringify(body)
      else serializedBody = body

      const headers: Record<string, string> = {
        Accept: 'application/json',
        Authorization: getters.authHeader
      }
      if (!(body instanceof FormData) && !isString(body)) {
        headers['Content-Type'] = 'application/json'
      }

      fetch(secrets.APIURL + path, {
        method: (method || 'get'),
        body: serializedBody,
        headers,
        credentials: 'include'
      }).then(response => {
        if (response.status === 401 && !skipResetAuth) {
          commit('RESET_AUTH')
          return
        }

        resolve(response)
      }).catch(error => reject(error))
    })
  },

  async requestJSON<T>(
    { dispatch }: ActionContext<RootState, RootState>,
    args: { method?: string; path: string; body?: Record<string, unknown> }
  ): Promise<APIResponse<T>> {
    const response = await dispatch('request', args)
    if (response.ok) {
      return new Ok({ response, body: await response.json() })
    }
    return new Err({ response, body: await response.json() })
  },

  /**
   * Loads information for a Squadron.
   *
   * @param username The name of the squadron.
   */

  async loadSquadron(
    { commit, dispatch, getters }: ActionContext<RootState, RootState>,
    { username }: { username: string | null }
  ): Promise<void> {
    if (getters.squadronLoading) return

    if (isNull(username)) {
      commit('FINISH_SQUADRON', { squadron: null })
      return
    }

    commit('START_SQUADRON')
    try {
      const result: APIResponse<SquadronJSONDown> = await dispatch('requestJSON', {
        path: `/squadrons/${username}.json`
      })
      const squadron = loadResponseBodyOrThrowError(result)
      commit('FINISH_SQUADRON', { squadron: squadronFromJSON(squadron) })
    } catch (error: unknown) {
      if (error instanceof Error) {
        commit('SET_SQUADRON_ERROR', { error })
        Bugsnag.notify(error)
      } else {
        throw error
      }
    }
  }
}

const root: StoreOptions<RootState> = {
  state, getters, mutations, actions
}
export default root
