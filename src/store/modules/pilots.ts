import { ActionContext, ActionTree, Module } from 'vuex'
import { Ok, Result } from 'ts-results'
import {
  APIResponse, Errors, PilotsState, RootState
} from '@/store/types'
import {
  ignoreResponseBodyOrThrowError,
  loadResponseBodyOrReturnErrors
} from '@/store/utils'

export function state(): PilotsState {
  return {}
}

const actions: ActionTree<PilotsState, RootState> = {

  /**
   * Merges two pilots, copying all Passes from the "prey" to the "predator" and then deleting the
   * "prey".
   *
   * @param predator The name of the pilot that will receive the Passes.
   * @param prey The name of the pilot that will be deleted.
   */

  async mergePilots(
    { dispatch }: ActionContext<PilotsState, RootState>,
    { predator, prey }: { predator: string; prey: string }
  ): Promise<void> {
    const result: APIResponse<void> = await dispatch('requestJSON', {
      method: 'post',
      path: `/squadron/pilots/${predator}/merge.json?other=${prey}`
    })
    return ignoreResponseBodyOrThrowError(result)
  },

  /**
   * Deletes a pilot and all their passes.
   *
   * @param pilot The name of the pilot to delete.
   */

  async deletePilot(
    { dispatch }: ActionContext<PilotsState, RootState>,
    { pilot }: { pilot: string }
  ): Promise<void> {
    const result: APIResponse<void> = await dispatch('requestJSON', {
      method: 'delete',
      path: `/squadron/pilots/${pilot}`
    })
    return ignoreResponseBodyOrThrowError(result)
  },

  /**
   * Renames a pilot.
   *
   * @param oldName The name of the pilot to rename.
   * @param newName The new name.
   * @return A Result containing nothing if successful, or validation errors if failed.
   */

  async renamePilot(
    { dispatch, commit },
    { oldName, newName }: { oldName: string, newName: string }
  ): Promise<Result<void, Errors>> {
    const result: APIResponse<void> = await dispatch('requestJSON', {
      method: 'put',
      path: `/squadron/pilots/${encodeURIComponent(oldName)}.json`,
      body: { name: newName }
    })
    const bodyResult = await loadResponseBodyOrReturnErrors(result)
    if (bodyResult.ok) {
      await commit('RENAME_PILOT', { oldName, newName })
      return new Ok(undefined)
    }
    return bodyResult
  }
}

const pilots: Module<PilotsState, RootState> = { state, actions }
export default pilots
