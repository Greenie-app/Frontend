import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { concat, get, has, isEmpty, isNull, keys, max, some, sortBy, values } from 'lodash-es'
import { Ok, Result } from 'ts-results'
import { DateTime } from 'luxon'
import type { Consumer, Subscription } from '@rails/actioncable'
import { useRootStore } from './root'
import { useAuthStore } from './auth'
import { useMySquadronStore } from './mySquadron'
import type { APIResponse, Errors } from '@/stores/types'
import type { Pass } from '@/types'
import { passFromJSON, type PassJSONDown, passToJSON } from '@/stores/coding'
import {
  ignoreResponseBodyOrThrowError,
  loadResponseBodyOrReturnErrors,
  loadResponseBodyOrThrowError,
} from '@/stores/utils'

let passesSubscription: Subscription | null = null

export const usePassesStore = defineStore('passes', () => {
  const passes = ref<Pass[] | null>(null)
  const passesLoading = ref(false)
  const passesError = ref<Error | null>(null)
  // Initialize with valid DateTime objects
  const now = DateTime.now()
  const initialStartDate = now.minus({ weeks: 4 }).startOf('day')
  const initialEndDate = now.endOf('day')

  const startDate = ref<DateTime>(initialStartDate)
  const endDate = ref<DateTime>(initialEndDate)

  const passesLoaded = computed(
    () => !isNull(passes.value) && !passesLoading.value && isNull(passesError.value),
  )

  // Calculate boarding rate from current passes
  const boardingRate = computed((): number | null => {
    if (isNull(passes.value) || passes.value.length === 0) return null

    // Count passes where trap is not null (these count towards boarding rate)
    const attempts = passes.value.filter((p) => !isNull(p.trap)).length
    if (attempts === 0) return null

    // Count successful traps
    const traps = passes.value.filter((p) => p.trap === true).length

    return traps / attempts
  })

  const passesByPilot = computed((): [string | null, Pass[]][] => {
    if (isNull(passes.value)) return []

    const passesByPilot: Record<string, Pass[]> = passes.value.reduce(
      (dict, pass) => {
        if (isNull(pass.pilot)) return dict
        if (!has(dict, pass.pilot)) dict[pass.pilot] = []
        dict[pass.pilot]!.push(pass)
        return dict
      },
      {} as Record<string, Pass[]>,
    )

    const collator = new Intl.Collator(navigator.language)
    const pilots = keys(passesByPilot).sort((a, b) => collator.compare(a, b))
    const pilotsAndPasses: [string | null, Pass[]][] = pilots.map((pilot) => [
      pilot,
      sortBy(passesByPilot[pilot], (p) => p.time.diffNow().milliseconds),
    ])

    const unknownPasses = sortBy(
      passes.value.filter((pass) => isNull(pass.pilot)),
      (p) => -p.time.diffNow().milliseconds,
    )
    if (!isEmpty(unknownPasses)) {
      pilotsAndPasses.push([null, unknownPasses])
    }

    return pilotsAndPasses
  })

  const passesForPilot = computed(() => (pilot: string): Pass[] => {
    if (isNull(passes.value)) return []
    return passes.value.filter((p) => p.pilot === pilot)
  })

  const maxPassesForPilot = computed(() => {
    if (isNull(passes.value)) return 0
    const passCounts: Record<string, number> = passes.value.reduce(
      (dict, pass) => {
        const key = get(pass, 'pilot.name', '')
        if (!has(dict, key)) dict[key] = 0
        dict[key]! += 1
        return dict
      },
      {} as Record<string, number>,
    )

    return max(values(passCounts)) || 0
  })

  const noPasses = computed(() => isEmpty(passes.value))

  const pilotNames = computed((): string[] => {
    if (isNull(passes.value)) return []
    const names = passes.value.reduce((set, pass) => {
      if (isNull(pass.pilot)) return set
      return new Set<string>([...set, pass.pilot])
    }, new Set<string>())
    return [...names]
  })

  function createPassesSubscription(consumer: Consumer) {
    if (passesSubscription) passesSubscription.unsubscribe()
    passesSubscription = consumer.subscriptions.create('PassesChannel', {
      received(passJSON: string) {
        passesSubscriptionMessage({ passJSON: JSON.parse(passJSON) })
      },
    })
  }

  function passesSubscriptionMessage({ passJSON }: { passJSON: PassJSONDown }) {
    updatePassesFromSubscription({ passJSON })

    const rootStore = useRootStore()
    if (passJSON.squadron) {
      rootStore.updateSquadronFromSubscription(passJSON.squadron)
    }
  }

  function updatePassesFromSubscription({ passJSON }: { passJSON: PassJSONDown }) {
    if (isNull(passes.value)) return

    const pass = passFromJSON(passJSON)

    // Check if pass is within the current date range
    const passInRange = pass.time >= startDate.value && pass.time <= endDate.value

    if (passJSON['destroyed?']) {
      passes.value = passes.value.filter((p) => p.ID !== passJSON.id)
    } else if (some(passes.value, (p) => p.ID === passJSON.id)) {
      // Update existing pass
      if (passInRange) {
        passes.value = [...passes.value.filter((p) => p.ID !== passJSON.id), pass]
      } else {
        // Remove if now outside range
        passes.value = passes.value.filter((p) => p.ID !== passJSON.id)
      }
    } else if (passInRange) {
      // Add new pass if in range
      passes.value = concat(passes.value, pass)
    }
  }

  /**
   * Loads Passes for a squadron within a date range.
   *
   * @param squadron The Squadron to load passes for.
   * @param dateRange Optional custom date range. If not provided, uses stored dates.
   */
  async function loadPasses({
    squadron,
    dateRange,
  }: {
    squadron: string
    dateRange?: { start: DateTime; end: DateTime }
  }): Promise<void> {
    if (passesLoading.value) return

    const authStore = useAuthStore()
    const rootStore = useRootStore()

    // Update stored dates if provided and valid
    if (dateRange) {
      // Ensure the dates are valid DateTime objects
      if (dateRange.start && dateRange.start.isValid) {
        startDate.value = dateRange.start
      }
      if (dateRange.end && dateRange.end.isValid) {
        endDate.value = dateRange.end
      }
    }

    if (passesSubscription) passesSubscription.unsubscribe()
    if (authStore.actionCableConsumer) {
      createPassesSubscription(authStore.actionCableConsumer)
    }

    passes.value = null
    passesError.value = null
    passesLoading.value = true

    try {
      // Date parameters are always required
      let path = `/squadrons/${squadron}/passes.json`

      // Ensure dates are valid before converting to ISO
      if (startDate.value && startDate.value.isValid && endDate.value && endDate.value.isValid) {
        const startISO = startDate.value.toISO()
        const endISO = endDate.value.toISO()
        path += `?start_date=${startISO}&end_date=${endISO}`
      } else {
        throw new Error('Invalid date range for loading passes')
      }

      const result: APIResponse<{ passes: PassJSONDown[]; boarding_rate: number | null }> =
        await rootStore.requestJSON({ path })
      const responseData = loadResponseBodyOrThrowError(result)
      const passesData = responseData.passes.map((pass) => passFromJSON(pass))
      passes.value = passesData
      passesLoading.value = false
    } catch (error: unknown) {
      if (error instanceof Error) {
        passesError.value = error
        passesLoading.value = false
      } else {
        throw error
      }
    }
  }

  /**
   * Adds a pass for the logged-in Squadron.
   * @param pass Pass data to save.
   * @return A Result containing the new Pass if successful, or validation errors if failed.
   */
  async function createPass({ pass }: { pass: Omit<Pass, 'ID'> }): Promise<Result<Pass, Errors>> {
    const rootStore = useRootStore()

    const result: APIResponse<PassJSONDown> = await rootStore.requestJSON({
      method: 'post',
      path: '/squadron/passes.json',
      body: { pass: passToJSON(pass) },
    })

    const passResult = await loadResponseBodyOrReturnErrors(result)
    if (passResult.ok) return new Ok(passFromJSON(passResult.val))
    return passResult
  }

  /**
   * Updates a Pass using local data.
   *
   * @param pass The Pass to update and the data to update it with.
   * @return A Result containing the new Pass if successful, or validation errors if failed.
   */
  async function updatePass({ pass }: { pass: Pass }): Promise<Result<Pass, Errors>> {
    const rootStore = useRootStore()

    const result: APIResponse<PassJSONDown> = await rootStore.requestJSON({
      method: 'put',
      path: `/squadron/passes/${pass.ID}.json`,
      body: { pass: passToJSON(pass) },
    })

    const passResult = await loadResponseBodyOrReturnErrors(result)
    if (passResult.ok) {
      const changedPass = passFromJSON(passResult.val)

      if (!isNull(passes.value)) {
        const index = passes.value.findIndex((p) => p.ID === pass.ID)
        if (index !== -1) {
          passes.value = [
            ...passes.value.slice(0, index),
            changedPass,
            ...passes.value.slice(index + 1),
          ]
        }
      }

      return new Ok(changedPass)
    }
    return passResult
  }

  /**
   * Deletes a pass.
   *
   * @param pass The Pass to delete.
   * @return The deleted Pass returned from the backend.
   */
  async function deletePass({ pass }: { pass: Pass }): Promise<Pass> {
    const rootStore = useRootStore()
    const mySquadronStore = useMySquadronStore()

    const result: APIResponse<PassJSONDown> = await rootStore.requestJSON({
      method: 'delete',
      path: `/squadron/passes/${pass.ID}.json`,
    })

    const passResponse = loadResponseBodyOrThrowError(result)
    if (!isNull(mySquadronStore.mySquadron)) {
      await loadPasses({ squadron: mySquadronStore.mySquadron.username })
    }
    return passFromJSON(passResponse)
  }

  /**
   * Deletes all passes not associated with a pilot.
   */
  async function deleteAllUnknown(): Promise<void> {
    const rootStore = useRootStore()
    const mySquadronStore = useMySquadronStore()

    const result: APIResponse<void> = await rootStore.requestJSON({
      method: 'delete',
      path: '/squadron/passes/unknown.json',
    })

    await ignoreResponseBodyOrThrowError(result)

    if (!isNull(mySquadronStore.mySquadron)) {
      return loadPasses({ squadron: mySquadronStore.mySquadron.username })
    }
    return undefined
  }

  function renamePilot({ oldName, newName }: { oldName: string; newName: string }) {
    if (isNull(passes.value)) return
    passes.value = passes.value.map((pass) => ({
      ...pass,
      pilot: pass.pilot === oldName ? newName : pass.pilot,
    }))
  }

  /**
   * Sets the date range to the current month.
   */
  function setCurrentMonth() {
    const now = DateTime.now()
    startDate.value = now.startOf('month')
    endDate.value = now.endOf('day')
  }

  /**
   * Sets the date range to the previous month.
   */
  function setPastMonth() {
    const now = DateTime.now()
    const lastMonth = now.minus({ months: 1 })
    startDate.value = lastMonth.startOf('month')
    endDate.value = lastMonth.endOf('month')
  }

  /**
   * Sets the date range to the current week.
   */
  function setCurrentWeek() {
    const now = DateTime.now()
    startDate.value = now.startOf('week')
    endDate.value = now.endOf('day')
  }

  /**
   * Sets the date range to the previous week.
   */
  function setPastWeek() {
    const now = DateTime.now()
    const lastWeek = now.minus({ weeks: 1 })
    startDate.value = lastWeek.startOf('week')
    endDate.value = lastWeek.endOf('week')
  }

  /**
   * Sets the date range to the last 4 weeks (default).
   */
  function setLast4Weeks() {
    const now = DateTime.now()
    startDate.value = now.minus({ weeks: 4 }).startOf('day')
    endDate.value = now.endOf('day')
  }

  function resetPasses() {
    passes.value = null
    passesError.value = null
    passesLoading.value = false
    const resetNow = DateTime.now()
    startDate.value = resetNow.minus({ weeks: 4 }).startOf('day')
    endDate.value = resetNow.endOf('day')
  }

  return {
    passes,
    passesLoading,
    passesError,
    boardingRate,
    startDate,
    endDate,
    passesLoaded,
    passesByPilot,
    passesForPilot,
    maxPassesForPilot,
    noPasses,
    pilotNames,
    loadPasses,
    createPass,
    updatePass,
    deletePass,
    deleteAllUnknown,
    renamePilot,
    setCurrentMonth,
    setPastMonth,
    setCurrentWeek,
    setPastWeek,
    setLast4Weeks,
    resetPasses,
  }
})
