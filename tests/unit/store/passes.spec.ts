import { Store } from 'vuex'
import { expect } from 'chai'
import { DateTime } from 'luxon'
import { Result } from 'ts-results'
import { merge } from 'lodash-es'
import passesJSON from '../../fixtures/passes.txt.json'
import passJSON from '../../fixtures/pass.txt.json'
import { createTestStore } from '../utils'
import { mockServer } from '../setup'
import { Errors, PassesState, RootState } from '@/store/types'
import { passFromJSON, PassJSONDown } from '@/store/coding'
import { Grade, Pass } from '@/types'

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
      const passes = JSON.parse(passesJSON).map((p: PassJSONDown) => passFromJSON(p))
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
        await mockServer.get('/squadrons/72nd/passes.json').thenReply(200, passesJSON, {
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
      })

      it('handles errors', async () => {
        await mockServer.get('/squadrons/72nd/passes.json').thenReply(500, '{"error":"oops"}')
        await store.dispatch('loadPasses', { squadron: '72nd' })

        const state = (<RootState & { passes: PassesState }>store.state).passes
        expect(state.passesLoading).to.be.false
        expect(state.passesError?.message).to.eql('Invalid HTTP response: 500')
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
        await mockServer.post('/squadron/passes.json').thenReply(200, passJSON)
        const result: Result<Pass, Errors> = await store.dispatch('createPass', { pass: newPass })

        expect(result.ok).to.be.true
        expect(result.val.ID).to.eql(12)
      })

      it('handles validation errors', async () => {
        await mockServer.post('/squadron/passes.json').thenReply(
          422,
          JSON.stringify({ errors: { score: ['not a number'] } })
        )
        const result: Result<Pass, Errors> = await store.dispatch('createPass', { pass })

        expect(result.ok).to.be.false
        expect(result.val).to.eql({ score: ['not a number'] })
      })

      it('handles other errors', done => {
        mockServer.post('/squadron/passes.json').thenReply(500, '{"error":"oops"}').then(() => {
          expect(store.dispatch('createPass', { pass }))
            .to.be.rejectedWith('Invalid HTTP response: 500').and.notify(done)
        })
      })
    })

    describe('#updatePass', () => {
      it('updates a pass', async () => {
        store.commit('FINISH_PASSES', { passes: [pass] })

        await mockServer.put('/squadron/passes/12.json').thenReply(200, passJSON)
        const result: Result<Pass, Errors> = await store.dispatch('updatePass', { pass })

        expect(result.ok).to.be.true
        expect(result.val.pilot).to.eql('Newguy')

        const state = (<RootState & { passes: PassesState }>store.state).passes
        expect(state.passes?.find(p => p.ID === 12)?.pilot).to.eql('Newguy')
      })

      it('handles validation errors', async () => {
        await mockServer.put('/squadron/passes/12.json').thenReply(
          422,
          JSON.stringify({ errors: { score: ['not a number'] } })
        )
        const result: Result<Pass, Errors> = await store.dispatch('updatePass', { pass })

        expect(result.ok).to.be.false
        expect(result.val).to.eql({ score: ['not a number'] })
      })

      it('handles other errors', done => {
        mockServer.put('/squadron/passes/12.json').thenReply(500, '{"error":"oops"}').then(() => {
          expect(store.dispatch('updatePass', { pass }))
            .to.be.rejectedWith('Invalid HTTP response: 500').and.notify(done)
        })
      })
    })

    describe('#deletePass', () => {
      it('deletes a pass', async () => {
        store.commit('FINISH_PASSES', { passes: [pass, { ...pass, ID: 13 }] })

        const responseJSON = merge(JSON.parse(passJSON), { 'destroyed?': true })
        await mockServer.delete('/squadron/passes/12.json').thenReply(200, JSON.stringify(responseJSON))
        const deletedPass: Pass = await store.dispatch('deletePass', { pass })

        expect(deletedPass.ID).to.eql(12)
      })

      it('handles errors', done => {
        mockServer.delete('/squadron/passes/12.json').thenReply(500, '{"error":"oops"}').then(() => {
          expect(store.dispatch('deletePass', { pass }))
            .to.be.rejectedWith('Invalid HTTP response: 500').and.notify(done)
        })
      })
    })
  })
})
