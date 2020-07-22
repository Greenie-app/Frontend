/* eslint-disable no-shadow,no-param-reassign */

import {
  ActionContext, ActionTree, Dispatch, GetterTree, Module, MutationTree
} from 'vuex'
import {
  concat,
  get,
  has,
  isEmpty,
  isNull,
  isUndefined,
  keys,
  max,
  some,
  sortBy,
  values
} from 'lodash-es'
import { Ok, Result } from 'ts-results'
import Bugsnag from '@bugsnag/js'
import ActionCable from 'actioncable'
import {
  APIResponse, Errors, PassesState, RootState
} from '@/store/types'
import { Pass } from '@/types'
import i18n from '@/i18n'
import { passFromJSON, PassJSONDown, passToJSON } from '@/store/coding'
import {
  ignoreResponseBodyOrThrowError,
  loadResponseBodyOrReturnErrors,
  loadResponseBodyOrThrowError
} from '@/store/utils'

let passesSubscription: ActionCable.Channel | null = null

function createPassesSubscription(consumer: ActionCable.Cable, dispatch: Dispatch) {
  if (passesSubscription) passesSubscription.unsubscribe()
  passesSubscription = consumer.subscriptions.create({
    channel: 'PassesChannel'
  }, {
    received(passJSON: string) {
      dispatch('passesSubscriptionMessage', { passJSON: JSON.parse(passJSON) })
    }
  })
}

export function state(): PassesState {
  return {
    passes: null,
    passesLoading: false,
    passesError: null,
    passCurrentPage: 1,
    passCount: 0
  }
}

const getters: GetterTree<PassesState, RootState> = {

  /** @return Whether the list of Passes has been loaded. */
  passesLoaded(state): boolean {
    return !isNull(state.passes) && !state.passesLoading && isNull(state.passesError)
  },

  /** @return Whether the list of passes is loading. */
  passesLoading(state): boolean {
    return state.passesLoading
  },

  /** @return Any error that occurred while loading the list of Passes. */
  passesError(state): Error | null {
    return state.passesError
  },

  /** @return The list of passes, sorted and split into arrays grouped by pilot name. */
  passesByPilot(state): [string | null, Pass[]][] {
    if (isNull(state.passes)) return []
    const passes: Record<string, Pass[]> = state.passes.reduce((dict, pass) => {
      if (isNull(pass.pilot)) return dict

      if (!has(dict, pass.pilot)) dict[pass.pilot] = []
      dict[pass.pilot].push(pass)
      return dict
    }, <Record<string, Pass[]>>{})

    const collator = new Intl.Collator(i18n.locale)
    const pilots = keys(passes).sort((a, b) => collator.compare(a, b))
    const pilotsAndPasses: [string | null, Pass[]][] = pilots.map(pilot => [
      pilot,
      sortBy(passes[pilot], p => -p.time.diffNow().milliseconds)
    ])

    const unknownPasses = sortBy(
      state.passes.filter(pass => isNull(pass.pilot)),
      p => -p.time.diffNow().milliseconds
    )
    if (!isEmpty(unknownPasses)) {
      pilotsAndPasses.push([null, unknownPasses])
    }

    return pilotsAndPasses
  },

  passesForPilot(state): (pilot: string) => Pass[] {
    /**
     * Returns the Passes flown by a given pilot.
     * @param pilot The pilot name.
     * @return The Passes flown by that pilot.
     */

    return function passesForPilot(pilot: string) {
      if (isNull(state.passes)) return []
      return state.passes.filter(p => p.pilot === pilot)
    }
  },

  /** @return The highest number of passes flown by a single pilot (for table layout). */
  maxPassesForPilot(state): number {
    if (isNull(state.passes)) return 0
    const passCounts: Record<string, number> = state.passes.reduce((dict, pass) => {
      const key = get(pass, 'pilot.name', '')
      if (!has(dict, key)) dict[key] = 0
      dict[key] += 1
      return dict
    }, <Record<string, number>>{})

    return max(values(passCounts)) || 0
  },

  /** @return True if the Squadron has no Passes. */
  noPasses(state): boolean {
    return isEmpty(state.passes)
  },

  /** @return The names of all the pilots who have flown Passes. */
  pilotNames(state): string[] {
    if (isNull(state.passes)) return []
    const names = state.passes.reduce((set, pass) => {
      if (isNull(pass.pilot)) return set
      return new Set<string>([...set, pass.pilot])
    }, new Set<string>())
    return [...names]
  },

  /** @return The page number of Passes that is currently loaded. */
  passCurrentPage(state): number {
    return state.passCurrentPage
  },

  /** @return The total number of Passes across all pages. */
  passCount(state): number {
    return state.passCount
  }
}

const mutations: MutationTree<PassesState> = {
  START_PASSES(state) {
    state.passes = null
    state.passesError = null
    state.passesLoading = true
    state.passCurrentPage = 1
    state.passCount = 0
  },

  FINISH_PASSES(state, { passes }: { passes: Pass[] }) {
    state.passes = passes
    state.passesLoading = false
  },

  SET_PASSES_ERROR(state, { error }: { error: Error }) {
    state.passesError = error
    state.passesLoading = false
  },

  RESET_PASSES(state) {
    state.passes = null
    state.passesError = null
    state.passesLoading = false
    state.passCurrentPage = 1
    state.passCount = 0
  },

  UPDATE_PASSES_FROM_SUBSCRIPTION(state, { passJSON }: { passJSON: PassJSONDown }) {
    if (isNull(state.passes)) return

    if (passJSON['destroyed?']) {
      state.passes = state.passes.filter(p => p.ID !== passJSON.id)
    } else if (some(state.passes, p => p.ID === passJSON.id)) {
      state.passes = [
        ...state.passes.filter(p => p.ID !== passJSON.id),
        passFromJSON(passJSON)
      ]
    } else {
      if (state.passCurrentPage !== 1) return
      // don't append new backups except on the first page
      state.passes = concat(state.passes, passFromJSON(passJSON))
    }
  },

  UPDATE_PASS_PAGES(state, { page, count }: { page: number, count: number }) {
    state.passCurrentPage = page
    state.passCount = count
  },

  UPDATE_PASS(state, { pass }: { pass: Pass }) {
    if (isNull(state.passes)) return

    const index = state.passes.findIndex(p => p.ID === pass.ID)
    if (index === -1) return

    state.passes = [
      ...state.passes.slice(0, index),
      pass,
      ...state.passes.slice(index + 1)
    ]
  },

  RENAME_PILOT(state, { oldName, newName }: { oldName: string, newName: string }) {
    if (isNull(state.passes)) return
    state.passes = state.passes.map(pass => ({
      ...pass,
      pilot: (pass.pilot === oldName) ? newName : pass.pilot
    }))
  }
}

const actions: ActionTree<PassesState, RootState> = {

  /**
   * Loads Passes for a squadron. Can be paginated.
   *
   * @param squadron The Squadron to load passes for.
   * @param page The page number to load (1-based, default 1).
   */

  async loadPasses(
    {
      commit, dispatch, getters, rootGetters
    }: ActionContext<PassesState, RootState>,
    { squadron, page }: { squadron: string; page?: number }
  ): Promise<void> {
    if (getters.passesLoading) return

    if (passesSubscription) passesSubscription.unsubscribe()
    if ((isUndefined(page) || page === 1) && rootGetters.actionCableConsumer) {
      createPassesSubscription(rootGetters.actionCableConsumer, dispatch)
    }

    commit('START_PASSES')
    try {
      const result: APIResponse<PassJSONDown[]> = await dispatch('requestJSON', {
        path: `/squadrons/${squadron}/passes.json?page=${page || 1}`
      })
      const passes = loadResponseBodyOrThrowError(result).map(pass => passFromJSON(pass))
      commit('FINISH_PASSES', { passes })

      const currentPage = result.val.response.headers.has('X-Page')
        ? Number.parseInt(result.val.response.headers.get('X-Page')!, 10) : 1
      const passCount = result.val.response.headers.has('X-Count')
        ? Number.parseInt(result.val.response.headers.get('X-Count')!, 10) : 1
      commit('UPDATE_PASS_PAGES', { page: currentPage, count: passCount })
    } catch (error) {
      commit('SET_PASSES_ERROR', { error })
      Bugsnag.notify(error)
    }
  },

  /**
   * Adds a pass for the logged-in Squadron.
   * @param pass Pass data to save.
   * @return A Result containing the new Pass if successful, or validation errors if failed.
   */

  async createPass(
    { dispatch }: ActionContext<PassesState, RootState>,
    { pass }: { pass: Omit<Pass, 'ID'> }
  ): Promise<Result<Pass, Errors>> {
    const result: APIResponse<PassJSONDown> = await dispatch('requestJSON', {
      method: 'post',
      path: '/squadron/passes.json',
      body: { pass: passToJSON(pass) }
    })

    const passResult = await loadResponseBodyOrReturnErrors(result)
    if (passResult.ok) return new Ok(passFromJSON(passResult.val))
    return passResult
  },

  /**
   * Updates a Pass using local data.
   *
   * @param pass The Pass to update and the data to update it with.
   * @return A Result containing the new Pass if successful, or validation errors if failed.
   */

  async updatePass(
    { dispatch, commit }: ActionContext<PassesState, RootState>,
    { pass }: { pass: Pass }
  ): Promise<Result<Pass, Errors>> {
    const result: APIResponse<PassJSONDown> = await dispatch('requestJSON', {
      method: 'put',
      path: `/squadron/passes/${pass.ID}.json`,
      body: { pass: passToJSON(pass) }
    })

    const passResult = await loadResponseBodyOrReturnErrors(result)
    if (passResult.ok) {
      const changedPass = passFromJSON(passResult.val)
      commit('UPDATE_PASS', { pass: changedPass })
      return new Ok(changedPass)
    }
    return passResult
  },

  /**
   * Deletes a pass.
   *
   * @param pass The Pass to delete.
   * @return The deleted Pass returned from the backend.
   */

  async deletePass(
    { dispatch, rootGetters }: ActionContext<PassesState, RootState>,
    { pass }: { pass: Pass }
  ): Promise<Pass> {
    const result: APIResponse<PassJSONDown> = await dispatch('requestJSON', {
      method: 'delete',
      path: `/squadron/passes/${pass.ID}.json`
    })

    const passResponse = loadResponseBodyOrThrowError(result)
    if (!isNull(rootGetters.mySquadron)) {
      await dispatch('loadPasses', { squadron: rootGetters.mySquadron.username })
    }
    return passFromJSON(passResponse)
  },

  /**
   * Deletes all passes not associated with a pilot.
   */

  async deleteAllUnknown({ rootGetters, dispatch }): Promise<void> {
    const result: APIResponse<void> = await dispatch('requestJSON', {
      method: 'delete',
      path: '/squadron/passes/unknown.json'
    })

    await ignoreResponseBodyOrThrowError(result)

    if (!isNull(rootGetters.mySquadron)) {
      return dispatch('loadPasses', { squadron: rootGetters.mySquadron.username })
    }
    return undefined
  },

  passesSubscriptionMessage({ commit }, { passJSON }: { passJSON: PassJSONDown }) {
    commit('UPDATE_PASSES_FROM_SUBSCRIPTION', { passJSON })
    commit('UPDATE_SQUADRON_FROM_SUBSCRIPTION', { squadron: passJSON.squadron })
  }
}

const passes: Module<PassesState, RootState> = {
  state, getters, mutations, actions
}
export default passes
