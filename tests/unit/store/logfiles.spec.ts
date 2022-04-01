import { Store } from 'vuex'
import { DateTime, Duration } from 'luxon'
import { expect } from 'chai'
import nock from 'nock'
import { createTestStore } from '../utils'
import { LogfilesState, RootState } from '@/store/types'
import { Logfile, LogfileState } from '@/types'

const logfileJSON = require('../../fixtures/logfile.json')
const logfilesJSON = require('../../fixtures/logfiles.json')

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
        const scope = nock('http://localhost:5100')
          .get('/squadron/logfiles.json')
          .reply(200, logfilesJSON)

        await store.dispatch('loadLogfiles')
        const state = (<RootState & { logfiles: LogfilesState }>store.state).logfiles

        expect(state.logfiles?.length).to.eql(3)
        expect(state.logfilesLoading).to.be.false
        expect(state.logfilesError).to.be.null
        expect(scope.isDone()).to.be.true
      })

      it('handles errors', async () => {
        const scope = nock('http://localhost:5100')
          .get('/squadron/logfiles.json')
          .reply(422, { error: 'Oops' })

        await store.dispatch('loadLogfiles')
        const state = (<RootState & { logfiles: LogfilesState }>store.state).logfiles

        expect(state.logfilesError?.message).to.eql('Invalid HTTP response: 422')
        expect(state.logfilesLoading).to.be.false
        expect(scope.isDone()).to.be.true
      })
    })

    describe('#uploadLogfiles', () => {
      it('uploads logfiles', async () => {
        const scope = nock('http://localhost:5100')
          .post('/squadron/logfiles.json')
          .reply(201, logfileJSON)

        const result = await store.dispatch('uploadLogfiles', { body: new FormData() })

        expect(result.ok).to.be.true
        expect(result.val.ID).to.eql(1)
        expect(scope.isDone()).to.be.true
      })

      it('handles errors', async () => {
        const scope = nock('http://localhost:5100')
          .post('/squadron/logfiles.json')
          .reply(422, { errors: { files: ['wrong format'] } })

        const result = await store.dispatch('uploadLogfiles', { body: new FormData() })

        expect(result.ok).to.be.false
        expect(result.val).to.eql({ files: ['wrong format'] })
        expect(scope.isDone()).to.be.true
      })
    })
  })
})
