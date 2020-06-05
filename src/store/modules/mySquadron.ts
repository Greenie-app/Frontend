/* eslint-disable no-shadow */

import {
  ActionTree, GetterTree, Module, MutationTree
} from 'vuex'
import { isNull } from 'lodash-es'
import { Ok, Result } from 'ts-results'
import Bugsnag from '@bugsnag/js'
import {
  APIResponse, Errors, MySquadronState, RootState
} from '@/store/types'
import { Squadron } from '@/types'
import { squadronFromJSON, SquadronJSONDown } from '@/store/coding'
import { loadResponseBodyOrReturnErrors, loadResponseBodyOrThrowError } from '@/store/utils'

export function state(): MySquadronState {
  return {
    mySquadron: null,
    mySquadronLoading: false,
    mySquadronError: null
  }
}

const getters: GetterTree<MySquadronState, RootState> = {
  /** @return The currently logged-in Squadron. */
  mySquadron(state): Squadron | null {
    return state.mySquadronLoading || state.mySquadronError ? null : state.mySquadron
  },

  /** @return True if loading squadron data for the logged-in Squadron. */
  mySquadronLoading(state): boolean {
    return state.mySquadronLoading
  },

  /** @return Any error that occurred while loading data for the logged-in Squadron. */
  mySquadronError(state): Error | null {
    return state.mySquadronError
  },

  /** @return True if the currently logged-in Squadron has had its information loaded. */
  mySquadronLoaded(state): boolean {
    return !isNull(state.mySquadron)
      && isNull(state.mySquadronError)
      && !state.mySquadronLoading
  }
}

const mutations: MutationTree<MySquadronState> = {
  START_MY_SQUADRON(state) {
    state.mySquadronLoading = true
    state.mySquadron = null
    state.mySquadronError = null
  },

  FINISH_MY_SQUADRON(state, { squadron }: {squadron: Squadron | null}) {
    state.mySquadron = squadron
    state.mySquadronLoading = false
  },

  SET_MY_SQUADRON_ERROR(state, { error }: {error: Error}) {
    state.mySquadronError = error
    state.mySquadronLoading = false
  }
}

const actions: ActionTree<MySquadronState, RootState> = {

  /**
   * Loads data for the currently logged-in Squadron.
   */

  async loadMySquadron({
    commit, dispatch, getters, rootGetters
  }): Promise<void> {
    if (getters.mySquadronLoading) return

    if (isNull(rootGetters.currentUsername)) {
      commit('FINISH_MY_SQUADRON', { squadron: null })
      return
    }

    commit('START_MY_SQUADRON')
    try {
      const result: APIResponse<SquadronJSONDown> = await dispatch('requestJSON', {
        path: `/squadrons/${rootGetters.currentUsername}.json`
      })
      const squadron = loadResponseBodyOrThrowError(result)
      commit('FINISH_MY_SQUADRON', { squadron: squadronFromJSON(squadron) })
    } catch (error) {
      commit('SET_MY_SQUADRON_ERROR', { error })
      Bugsnag.notify(error)
    }
  },

  /**
   * Changes the attributes of the logged-in Squadron.
   *
   * @param body The form data.
   * @return A Result containing the updated Squadron if successful, or validation errors if failed.
   */

  async updateMySquadron(
    { commit, dispatch },
    { body }: { body: FormData }
  ): Promise<Result<Squadron, Errors>> {
    try {
      const result: APIResponse<SquadronJSONDown> = await dispatch('requestJSON', {
        method: 'put',
        path: '/squadron.json',
        body
      })
      const squadronResult = await loadResponseBodyOrReturnErrors(result)

      if (squadronResult.ok) {
        const changedSquadron = squadronFromJSON(squadronResult.val)
        commit('FINISH_MY_SQUADRON', { squadron: changedSquadron })
        return new Ok(changedSquadron)
      }
      return squadronResult
    } catch (error) {
      commit('SET_MY_SQUADRON_ERROR', { error })
      throw error
    }
  }
}

const mySquadron: Module<MySquadronState, RootState> = {
  state, getters, mutations, actions
}
export default mySquadron
