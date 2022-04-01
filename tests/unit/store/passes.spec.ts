import 'cross-fetch/polyfill'
import { Store } from 'vuex'
import { expect } from 'chai'
import { DateTime } from 'luxon'
import { Result } from 'ts-results'
import { merge } from 'lodash-es'
import nock from 'nock'
import { createTestStore } from '../utils'
import { Errors, PassesState, RootState } from '@/store/types'
import { passFromJSON, PassJSONDown } from '@/store/coding'
import { Grade, Pass } from '@/types'

const passJSON = require('../../fixtures/pass.json')
const passesJSON = require('../../fixtures/passes.json')

describe('Vuex: passes', () => {
  let store: Store<RootState>

  let pass: Pass

  beforeEach(() => {
    pass = {
      ID: 12,
      pilot: 'Jambo72nd',
      time: DateTime.utc(),
      shipName: 'CVN-72',
      aircraftType: 'F-14B',
      grade: Grade.OK,
      score: 4,
      trap: true,
      wire: 3,
      notes: 'LUL IC'
    }

    store = createTestStore()
  })

  context('getters', () => {
    beforeEach(() => {
      const passes = passesJSON.map((p: PassJSONDown) => passFromJSON(p))
      store.commit('FINISH_PASSES', { passes })
    })

    describe('#passesByPilot', () => {
      it('returns passes grouped by pilot, sorted', () => {
        const { passesByPilot } = <{ passesByPilot: [string | null, Pass[]][] }>store.getters
        expect(passesByPilot.map(([name, passes]) => [name, passes.map(p => p.ID)])).to.eql([
          ['Jambo72nd', [12]],
          ['Raamon', [10]],
          ['Stretch | 55FS', [4, 11]],
          [null, [9, 8, 7, 6, 5, 3, 2, 1]]
        ])
      })

      it('returns an empty array if no passes are loaded', () => {
        store.commit('RESET_PASSES')
        expect(store.getters.passesByPilot).to.eql([])
      })
    })

    describe('#passesForPilot', () => {
      it('returns passes for a pilot', () => {
        const passes: Pass[] = store.getters.passesForPilot('Stretch | 55FS')
        expect(passes.map(p => p.ID)).to.deep.equalInAnyOrder([4, 11])
      })

      it('returns an empty array if the pilot is unknown', () => {
        expect(store.getters.passesForPilot('hi')).to.eql([])
      })
    })

    describe('#maxPassesForPilot', () => {
      it('returns the maximum number of passes among pilots', () => {
        expect(store.getters.maxPassesForPilot).to.eql(12)
      })

      it('returns 0 if no passes are loaded', () => {
        store.commit('RESET_PASSES')
        expect(store.getters.maxPassesForPilot).to.eql(0)
      })
    })

    describe('#pilotNames', () => {
      it('returns a set of all pilot names', () => {
        expect(store.getters.pilotNames).to.eql(['Jambo72nd', 'Stretch | 55FS', 'Raamon'])
      })
    })
  })

  context('actions', () => {
    describe('#loadPasses', () => {
      it('loads passes', async () => {
        const scope = nock('http://localhost:5100')
          .get('/squadrons/72nd/passes.json')
          .query({ page: 1 })
          .reply(200, passesJSON, {
            'X-Page': '1',
            'X-Count': '12'
          })

        await store.dispatch('loadPasses', { squadron: '72nd' })
        const state = (<RootState & { passes: PassesState }>store.state).passes

        expect(state.passes?.length).to.eql(12)
        expect(state.passesLoading).to.be.false
        expect(state.passesError).to.be.null
        expect(state.passCount).to.eql(12)
        expect(state.passCurrentPage).to.eql(1)

        expect(scope.isDone()).to.be.true
      })

      it('handles errors', async () => {
        const scope = nock('http://localhost:5100')
          .get('/squadrons/72nd/passes.json?page=1')
          .reply(500, { error: 'oops' })

        await store.dispatch('loadPasses', { squadron: '72nd' })
        const state = (<RootState & { passes: PassesState }>store.state).passes

        expect(state.passesLoading).to.be.false
        expect(state.passesError?.message).to.eql('Invalid HTTP response: 500')
        expect(scope.isDone()).to.be.true
      })
    })

    describe('#createPass', () => {
      let newPass: Omit<Pass, 'ID'>

      beforeEach(() => {
        newPass = {
          pilot: 'Newguy',
          time: DateTime.utc(),
          shipName: 'CVN-72',
          aircraftType: 'F-14B',
          grade: Grade.OK,
          score: 4,
          trap: true,
          wire: 3,
          notes: 'LUL IC'
        }
      })

      it('creates a pass', async () => {
        const scope = nock('http://localhost:5100')
          .post('/squadron/passes.json')
          .reply(200, passJSON)

        const result: Result<Pass, Errors> = await store.dispatch('createPass', { pass: newPass })

        expect(result.ok).to.be.true
        expect(result.val.ID).to.eql(12)
        expect(scope.isDone()).to.be.true
      })

      it('handles validation errors', async () => {
        const scope = nock('http://localhost:5100')
          .post('/squadron/passes.json')
          .reply(422, { errors: { score: ['not a number'] } })

        const result: Result<Pass, Errors> = await store.dispatch('createPass', { pass })

        expect(result.ok).to.be.false
        expect(result.val).to.eql({ score: ['not a number'] })
        expect(scope.isDone()).to.be.true
      })

      it('handles other errors', () => {
        const scope = nock('http://localhost:5100')
          .post('/squadron/passes.json')
          .reply(500, { error: 'oops' })

        return expect(store.dispatch('createPass', { pass }))
          .to.be.rejectedWith('Invalid HTTP response: 500').then(() => {
            expect(scope.isDone()).to.be.true
          })
      })
    })

    describe('#updatePass', () => {
      it('updates a pass', async () => {
        store.commit('FINISH_PASSES', { passes: [pass] })

        const scope = nock('http://localhost:5100')
          .put('/squadron/passes/12.json')
          .reply(200, passJSON)
        const result: Result<Pass, Errors> = await store.dispatch('updatePass', { pass })

        expect(result.ok).to.be.true
        expect(result.val.pilot).to.eql('Newguy')

        const state = (<RootState & { passes: PassesState }>store.state).passes
        expect(state.passes?.find(p => p.ID === 12)?.pilot).to.eql('Newguy')

        expect(scope.isDone()).to.be.true
      })

      it('handles validation errors', async () => {
        const scope = nock('http://localhost:5100')
          .put('/squadron/passes/12.json')
          .reply(422, { errors: { score: ['not a number'] } })

        const result: Result<Pass, Errors> = await store.dispatch('updatePass', { pass })

        expect(result.ok).to.be.false
        expect(result.val).to.eql({ score: ['not a number'] })
        expect(scope.isDone()).to.be.true
      })

      it('handles other errors', () => {
        const scope = nock('http://localhost:5100')
          .put('/squadron/passes/12.json')
          .reply(500, { error: 'oops' })

        return expect(store.dispatch('updatePass', { pass }))
          .to.be.rejectedWith('Invalid HTTP response: 500').then(() => {
            expect(scope.isDone()).to.be.true
          })
      })
    })

    describe('#deletePass', () => {
      it('deletes a pass', async () => {
        store.commit('FINISH_PASSES', { passes: [pass, { ...pass, ID: 13 }] })
        const responseJSON = merge(passJSON, { 'destroyed?': true })
        const scope = nock('http://localhost:5100')
          .delete('/squadron/passes/12.json')
          .reply(200, responseJSON)

        const deletedPass: Pass = await store.dispatch('deletePass', { pass })

        expect(deletedPass.ID).to.eql(12)
        expect(scope.isDone()).to.be.true
      })

      it('handles errors', () => {
        const scope = nock('http://localhost:5100')
          .delete('/squadron/passes/12.json')
          .reply(500, { error: 'oops' })

        return expect(store.dispatch('deletePass', { pass }))
          .to.be.rejectedWith('Invalid HTTP response: 500').then(() => {
            expect(scope.isDone()).to.be.true
          })
      })
    })
  })
})
