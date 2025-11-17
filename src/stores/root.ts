import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { has, isNull, isString } from 'lodash-es'
import { Err, Ok } from 'ts-results'
import { useAuthStore } from './auth'
import { useMySquadronStore } from './mySquadron'
import type { APIResponse } from '@/stores/types'
import type { Squadron } from '@/types'
import secrets from '@/config/secrets'
import { squadronFromJSON, type SquadronJSONDown } from '@/stores/coding'
import { FROZEN_MODULES, loadResponseBodyOrThrowError } from '@/stores/utils'

export const useRootStore = defineStore('root', () => {
  const squadron = ref<Squadron | null>(null)
  const squadronLoading = ref(false)
  const squadronError = ref<Error | null>(null)

  const squadronComputed = computed(() =>
    squadronLoading.value || squadronError.value ? null : squadron.value,
  )
  const squadronLoaded = computed(
    () => !isNull(squadron.value) && isNull(squadronError.value) && !squadronLoading.value,
  )
  const unknownPassCount = computed(() =>
    isNull(squadron.value) ? 0 : squadron.value.unknownPassCount,
  )

  function initialize() {
    const storedStateJSON = localStorage.getItem('store')
    if (!isNull(storedStateJSON)) {
      const storedState = JSON.parse(storedStateJSON)
      FROZEN_MODULES.forEach((mod) => {
        if (has(storedState, mod)) {
          const storeName = mod === 'mySquadron' ? 'mySquadron' : mod
          const store = useStore(storeName)
          if (store && 'initialize' in store && typeof store.initialize === 'function') {
            store.initialize(storedState[mod])
          }
        }
      })
    }
  }

  async function request({
    method = 'get',
    path,
    body,
    skipResetAuth = false,
  }: {
    method?: string
    path: string
    body?: Record<string, unknown> | FormData | string
    skipResetAuth?: boolean
  }): Promise<Response> {
    const authStore = useAuthStore()

    let serializedBody: FormData | string | undefined
    if (body) {
      if (!(body instanceof FormData) && !isString(body)) {
        serializedBody = JSON.stringify(body)
      } else {
        serializedBody = body
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    const { authHeader } = authStore
    if (authHeader) {
      headers.Authorization = authHeader
    }

    if (body && !(body instanceof FormData) && !isString(body)) {
      headers['Content-Type'] = 'application/json'
    }

    try {
      const response = await fetch(secrets.APIURL + path, {
        method,
        body: serializedBody,
        headers,
        credentials: 'include',
      })

      if (response.status === 401 && !skipResetAuth) {
        authStore.resetAuth()
      }

      return response
    } catch (error) {
      throw error
    }
  }

  async function requestJSON<T>({
    method,
    path,
    body,
  }: {
    method?: string
    path: string
    body?: Record<string, unknown> | FormData
  }): Promise<APIResponse<T>> {
    const response = await request({ method, path, body })
    if (response.ok) {
      const text = await response.text()
      const jsonBody = text ? JSON.parse(text) : null
      return new Ok({ response, body: jsonBody })
    }
    const errorText = await response.text()
    const errorBody = errorText ? JSON.parse(errorText) : null
    return new Err({ response, body: errorBody })
  }

  async function loadSquadron({ username }: { username: string | null }) {
    if (squadronLoading.value) return

    if (isNull(username)) {
      squadron.value = null
      squadronLoading.value = false
      return
    }

    squadronLoading.value = true
    squadronError.value = null

    try {
      const result: APIResponse<SquadronJSONDown> = await requestJSON({
        path: `/squadrons/${username}.json`,
      })
      const squadronData = loadResponseBodyOrThrowError(result)
      squadron.value = squadronFromJSON(squadronData)
      squadronLoading.value = false
    } catch (error: unknown) {
      if (error instanceof Error) {
        squadronError.value = error
        squadronLoading.value = false
      } else {
        throw error
      }
    }
  }

  function resetSquadron() {
    squadron.value = null
    squadronLoading.value = false
    squadronError.value = null
  }

  function updateSquadronFromSubscription(squadronData: SquadronJSONDown) {
    if (
      !squadronLoading.value &&
      !squadronError.value &&
      !isNull(squadron.value) &&
      squadronData.id === squadron.value.ID
    ) {
      squadron.value = squadronFromJSON(squadronData)
    }
  }

  return {
    squadron: squadronComputed,
    squadronLoading: computed(() => squadronLoading.value),
    squadronError: computed(() => squadronError.value),
    squadronLoaded,
    unknownPassCount,
    initialize,
    request,
    requestJSON,
    loadSquadron,
    resetSquadron,
    updateSquadronFromSubscription,
  }
})

// Helper to get store by name
function useStore(name: string) {
  switch (name) {
    case 'auth':
      return useAuthStore()
    case 'mySquadron':
      return useMySquadronStore()
    default:
      return null
  }
}
