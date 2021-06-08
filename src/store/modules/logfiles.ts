/* eslint-disable no-shadow */

import * as ActionCable from 'actioncable'
import {
  ActionContext, ActionTree, Dispatch, GetterTree, Module, MutationTree
} from 'vuex'
import { isNull } from 'lodash-es'
import { Ok, Result } from 'ts-results'
import Bugsnag from '@bugsnag/js'
import { Logfile, LogfileState } from '@/types'
import {
  APIResponse, Errors, LogfilesState, RootState
} from '@/store/types'
import { logfileFromJSON, LogfileJSON } from '@/store/coding'
import { loadResponseBodyOrReturnErrors, loadResponseBodyOrThrowError } from '@/store/utils'

let logfilesSubscription: ActionCable.Channel | null = null

function createLogfilesSubscription(consumer: ActionCable.Cable, dispatch: Dispatch) {
  if (logfilesSubscription) logfilesSubscription.unsubscribe()
  logfilesSubscription = consumer.subscriptions.create({
    channel: 'LogfilesChannel'
  }, {
    received(logfileJSON: string) {
      dispatch('logfilesSubscriptionMessage', { logfileJSON: JSON.parse(logfileJSON) })
    }
  })
}

export function state(): LogfilesState {
  return {
    logfiles: null,
    logfilesLoading: false,
    logfilesError: null
  }
}

const getters: GetterTree<LogfilesState, RootState> = {

  /** @return Whether the list of Logfiles has finished loading. */
  logfilesLoaded(state): boolean {
    return !isNull(state.logfiles) && !state.logfilesLoading && isNull(state.logfilesError)
  },

  /** @return Whether the list of Logfiles is currently loading. */
  logfilesLoading(state): boolean {
    return state.logfilesLoading
  },

  /** @return Any error that occurred while loading Logfiles. */
  logfilesError(state): Error | null {
    return state.logfilesError
  },

  /** @return The list of unfinished Logfiles for the current Squadron. */
  logfiles(state): Logfile[] {
    if (isNull(state.logfiles)) return []
    return state.logfiles.sort((a, b) => b.createdAt.diff(a.createdAt).as('seconds'))
  }
}

const mutations: MutationTree<LogfilesState> = {
  START_LOGFILES(state) {
    state.logfilesLoading = true
    state.logfiles = []
    state.logfilesError = null
  },

  FINISH_LOGFILES(state, { logfiles }: { logfiles: Logfile[] }) {
    state.logfiles = logfiles.filter(f => f.state !== LogfileState.Complete)
    state.logfilesLoading = false
  },

  SET_LOGFILES_ERROR(state, { error }: { error: Error }) {
    state.logfilesError = error
    state.logfilesLoading = false
  },

  RESET_LOGFILES(state) {
    state.logfilesLoading = false
    state.logfiles = []
    state.logfilesError = null
  },

  UPDATE_LOGFILES_FROM_SUBSCRIPTION(state, { logfileJSON }: { logfileJSON: LogfileJSON }) {
    if (isNull(state.logfiles)) return

    const index = state.logfiles.findIndex(f => f.ID === logfileJSON.id)

    let logfiles
    if (logfileJSON['destroyed?']) {
      logfiles = [
        ...state.logfiles.slice(0, index - 1),
        ...state.logfiles.slice(index + 1)
      ]
    } else {
      logfiles = [
        ...state.logfiles.slice(0, index - 1),
        logfileFromJSON(logfileJSON),
        ...state.logfiles.slice(index + 1)
      ]
    }

    state.logfiles = logfiles
  }
}

const actions: ActionTree<LogfilesState, RootState> = {

  /**
   * Loads the list of unfinished Logfiles for the logged-in squadron.
   */

  async loadLogfiles(
    {
      commit, dispatch, getters, rootGetters
    }: ActionContext<LogfilesState, RootState>
  ): Promise<void> {
    if (getters.logfilesLoading) return

    try {
      commit('START_LOGFILES')
      const result: APIResponse<LogfileJSON[]> = await dispatch('requestJSON', { path: '/squadron/logfiles.json' })
      const logfiles = loadResponseBodyOrThrowError(result).map(logfile => logfileFromJSON(logfile))
      commit('FINISH_LOGFILES', { logfiles })

      if (rootGetters.actionCableConsumer) {
        createLogfilesSubscription(rootGetters.actionCableConsumer, dispatch)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        commit('SET_LOGFILES_ERROR', { error })
        Bugsnag.notify(error)
      } else {
        throw error
      }
    }
  },

  resetLogfiles({ commit }) {
    commit('RESET_LOGFILES')
  },

  /**
   * Uploads one or more dcs.log files to the backend.
   *
   * @param body The form data.
   * @return A Result containing the created Logfile if successful, or the validation errors if
   *   failed.
   */

  async uploadLogfiles(
    { dispatch }: ActionContext<LogfilesState, RootState>,
    { body }: { body: FormData }
  ): Promise<Result<Logfile, Errors>> {
    const result: APIResponse<LogfileJSON> = await dispatch('requestJSON', {
      method: 'post',
      path: '/squadron/logfiles.json',
      body
    })
    const logfileResult = await loadResponseBodyOrReturnErrors(result)
    if (logfileResult.ok) return new Ok(logfileFromJSON(logfileResult.val))
    return logfileResult
  },

  logfilesSubscriptionMessage(
    { commit, rootGetters },
    { logfileJSON }: { logfileJSON: LogfileJSON }
  ) {
    if (isNull(rootGetters.mySquadron)) return

    commit('UPDATE_LOGFILES_FROM_SUBSCRIPTION', { logfileJSON })
  }
}

const logfiles: Module<LogfilesState, RootState> = {
  state, getters, mutations, actions
}
export default logfiles
