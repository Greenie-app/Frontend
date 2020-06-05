import { Store } from 'vuex'
import { DateTime, Duration } from 'luxon'
import { expect } from 'chai'
import { mockServer } from '../setup'
import logfileJSON from '../../fixtures/logfile.txt.json'
import logfilesJSON from '../../fixtures/logfiles.txt.json'
import { createTestStore } from '../utils'
import { LogfilesState, RootState } from '@/store/types'
import { Logfile, LogfileState } from '@/types'

const logfiles: Logfile[] = [
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
]

describe('Vuex: logfiles', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
  })

  context('getters', () => {
    describe('#logfiles', () => {
      it('returns logfiles sorted by date', () => {
        store.commit('FINISH_LOGFILES', { logfiles })
        const sorted: Logfile[] = store.getters.logfiles
        expect(sorted.map(l => l.ID)).to.eql([1, 3, 2])
      })
    })
  })

  context('actions', () => {
    describe('#loadLogfiles', () => {
      it('loads logfiles', async () => {
        await mockServer.get('/squadron/logfiles.json').thenReply(200, logfilesJSON)
        await store.dispatch('loadLogfiles')

        const state = (<RootState & { logfiles: LogfilesState }>store.state).logfiles
        expect(state.logfiles?.length).to.eql(3)
        expect(state.logfilesLoading).to.be.false
        expect(state.logfilesError).to.be.null
      })

      it('handles errors', async () => {
        await mockServer.get('/squadron/logfiles.json').thenReply(422, '{"error":"Oops"}')
        await store.dispatch('loadLogfiles')

        const state = (<RootState & { logfiles: LogfilesState }>store.state).logfiles
        expect(state.logfilesError?.message).to.eql('Invalid HTTP response: 422')
        expect(state.logfilesLoading).to.be.false
      })
    })

    describe('#uploadLogfiles', () => {
      it('uploads logfiles', async () => {
        await mockServer.post('/squadron/logfiles.json').thenReply(201, logfileJSON)
        const result = await store.dispatch('uploadLogfiles', { body: new FormData() })

        expect(result.ok).to.be.true
        expect(result.val.ID).to.eql(1)
      })

      it('handles errors', async () => {
        await mockServer.post('/squadron/logfiles.json').thenReply(
          422,
          JSON.stringify({ errors: { files: ['wrong format'] } })
        )
        const result = await store.dispatch('uploadLogfiles', { body: new FormData() })

        expect(result.ok).to.be.false
        expect(result.val).to.eql({ files: ['wrong format'] })
      })
    })
  })
})
