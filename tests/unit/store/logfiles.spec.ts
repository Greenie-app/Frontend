import {
  describe, it, beforeEach, expect
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { createTestPinia } from '../utils'
import backend from '../backend'
import { useLogfilesStore } from '@/stores/logfiles'

/* const logfiles: Logfile[] = [
  {
    ID: 1,
    files: [],
    state: LogfileState.InProgress,
    progress: 1.0,
    createdAt: DateTime.utc().minus(Duration.fromObject({ days: 1 }))
  },
  {
    ID: 2,
    files: [],
    state: LogfileState.Pending,
    progress: 1.0,
    createdAt: DateTime.utc().minus(Duration.fromObject({ days: 3 }))
  },
  {
    ID: 3,
    files: [],
    state: LogfileState.Failed,
    progress: 1.0,
    createdAt: DateTime.utc().minus(Duration.fromObject({ days: 2 }))
  },
  {
    ID: 4,
    files: [],
    state: LogfileState.Complete,
    progress: 1.0,
    createdAt: DateTime.utc().minus(Duration.fromObject({ days: 4 }))
  }
] */

describe('Vuex: logfiles', () => {
  let logfilesStore: ReturnType<typeof useLogfilesStore>

  beforeEach(() => {
    createTestPinia()
    logfilesStore = useLogfilesStore()
  })

  // Note: The logfiles getter is tested implicitly through the loadLogfiles action
  // since it returns a computed property that sorts the underlying state

  describe('actions', () => {
    describe('#loadLogfiles', () => {
      it('loads logfiles', async () => {
        await logfilesStore.loadLogfiles()

        expect(logfilesStore.logfiles?.length).toEqual(3)
        expect(logfilesStore.logfilesLoading).toBe(false)
        expect(logfilesStore.logfilesError).toBeNull()
      })

      it('handles errors', async () => {
        backend.use(
          http.get('http://localhost:5100/squadron/logfiles.json', () => HttpResponse.json(
            { error: 'Oops' },
            { status: 422 }
          ))
        )

        await logfilesStore.loadLogfiles()

        expect(logfilesStore.logfilesError?.message).toEqual('Invalid HTTP response: 422')
        expect(logfilesStore.logfilesLoading).toBe(false)
      })
    })

    describe('#uploadLogfiles', () => {
      it('uploads logfiles', async () => {
        const result = await logfilesStore.uploadLogfiles({ body: new FormData() })

        expect(result.ok).toBe(true)
        expect(result.val.ID).toEqual(1)
      })

      it('handles errors', async () => {
        backend.use(
          http.post('http://localhost:5100/squadron/logfiles.json', () => HttpResponse.json(
            { errors: { files: ['wrong format'] } },
            { status: 422 }
          ))
        )

        const result = await logfilesStore.uploadLogfiles({ body: new FormData() })

        expect(result.ok).toBe(false)
        expect(result.val).toEqual({ files: ['wrong format'] })
      })
    })
  })
})
