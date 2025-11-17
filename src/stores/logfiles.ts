import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isNull } from 'lodash-es'
import { Ok, Result } from 'ts-results'
import type { Consumer, Subscription } from '@rails/actioncable'
import { useRootStore } from './root'
import { useAuthStore } from './auth'
import { useMySquadronStore } from './mySquadron'
import { Logfile, LogfileState } from '@/types'
import type { APIResponse, Errors } from '@/stores/types'
import { logfileFromJSON, type LogfileJSON } from '@/stores/coding'
import { loadResponseBodyOrReturnErrors, loadResponseBodyOrThrowError } from '@/stores/utils'

let logfilesSubscription: Subscription | null = null

export const useLogfilesStore = defineStore('logfiles', () => {
  const logfiles = ref<Logfile[] | null>(null)
  const logfilesLoading = ref(false)
  const logfilesError = ref<Error | null>(null)

  const logfilesLoaded = computed(
    () => !isNull(logfiles.value) && !logfilesLoading.value && isNull(logfilesError.value),
  )

  const logfilesSorted = computed((): Logfile[] => {
    if (isNull(logfiles.value)) return []
    return logfiles.value.sort((a, b) => b.createdAt.diff(a.createdAt).as('seconds'))
  })

  function createLogfilesSubscription(consumer: Consumer) {
    if (logfilesSubscription) logfilesSubscription.unsubscribe()
    logfilesSubscription = consumer.subscriptions.create('LogfilesChannel', {
      received(logfileJSON: string) {
        logfilesSubscriptionMessage({ logfileJSON: JSON.parse(logfileJSON) })
      },
    })
  }

  function logfilesSubscriptionMessage({ logfileJSON }: { logfileJSON: LogfileJSON }) {
    const mySquadronStore = useMySquadronStore()
    if (isNull(mySquadronStore.mySquadron)) return

    updateLogfilesFromSubscription({ logfileJSON })
  }

  function updateLogfilesFromSubscription({ logfileJSON }: { logfileJSON: LogfileJSON }) {
    if (isNull(logfiles.value)) return

    const index = logfiles.value.findIndex((f) => f.ID === logfileJSON.id)

    let updatedLogfiles
    if (logfileJSON['destroyed?']) {
      updatedLogfiles = [...logfiles.value.slice(0, index), ...logfiles.value.slice(index + 1)]
    } else {
      updatedLogfiles = [
        ...logfiles.value.slice(0, index),
        logfileFromJSON(logfileJSON),
        ...logfiles.value.slice(index + 1),
      ]
    }

    logfiles.value = updatedLogfiles
  }

  /**
   * Loads the list of unfinished Logfiles for the logged-in squadron.
   */
  async function loadLogfiles(): Promise<void> {
    if (logfilesLoading.value) return

    const authStore = useAuthStore()
    const rootStore = useRootStore()

    try {
      logfilesLoading.value = true
      logfiles.value = []
      logfilesError.value = null

      const result: APIResponse<LogfileJSON[]> = await rootStore.requestJSON({
        path: '/squadron/logfiles.json',
      })
      const logfilesData = loadResponseBodyOrThrowError(result).map((logfile) =>
        logfileFromJSON(logfile),
      )

      logfiles.value = logfilesData.filter((f) => f.state !== LogfileState.Complete)
      logfilesLoading.value = false

      if (authStore.actionCableConsumer) {
        createLogfilesSubscription(authStore.actionCableConsumer)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logfilesError.value = error
        logfilesLoading.value = false
      } else {
        throw error
      }
    }
  }

  function resetLogfiles() {
    logfilesLoading.value = false
    logfiles.value = []
    logfilesError.value = null
  }

  /**
   * Uploads one or more dcs.log files to the backend.
   *
   * @param body The form data.
   * @return A Result containing the created Logfile if successful, or the validation errors if
   *   failed.
   */
  async function uploadLogfiles({ body }: { body: FormData }): Promise<Result<Logfile, Errors>> {
    const rootStore = useRootStore()

    const result: APIResponse<LogfileJSON> = await rootStore.requestJSON({
      method: 'post',
      path: '/squadron/logfiles.json',
      body,
    })
    const logfileResult = await loadResponseBodyOrReturnErrors(result)
    if (logfileResult.ok) return new Ok(logfileFromJSON(logfileResult.val))
    return logfileResult
  }

  return {
    logfiles: logfilesSorted,
    logfilesLoading: computed(() => logfilesLoading.value),
    logfilesError: computed(() => logfilesError.value),
    logfilesLoaded,
    loadLogfiles,
    resetLogfiles,
    uploadLogfiles,
  }
})
