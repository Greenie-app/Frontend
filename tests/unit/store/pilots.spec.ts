import { Store } from 'vuex'
import { expect } from 'chai'
import nock from 'nock'
import { createTestStore } from '../utils'
import { PassesState, RootState } from '@/store/types'
import { passFromJSON, PassJSONDown } from '@/store/coding'

const passesJSON = require('../../fixtures/passes.json')

describe('Vuex: pilots', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    store.commit('FINISH_PASSES', {
      passes: passesJSON.map((p: PassJSONDown) => passFromJSON(p))
    })
  })

  describe('#renamePilot', () => {
    it('renames a pilot', async () => {
      const scope = nock('http://localhost:5100')
        .put('/squadron/pilots/Stretch%20%7C%2055FS.json')
        .reply(200, { ok: true })

      const result = await store.dispatch('renamePilot', {
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result.ok).to.be.true
      const state = (<RootState & { passes: PassesState }>store.state).passes
      expect(state.passes?.filter(p => p.pilot === 'Stretch')?.map(p => p.ID))
        .to.deep.equalInAnyOrder([11, 4])
      expect(scope.isDone()).to.be.true
    })

    it('handles validation errors', async () => {
      const scope = nock('http://localhost:5100')
        .put('/squadron/pilots/Stretch%20%7C%2055FS.json')
        .reply(422, { errors: { name: ['must be present'] } })

      const result = await store.dispatch('renamePilot', {
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result.ok).to.be.false
      expect(result.val).to.eql({ name: ['must be present'] })
      expect(scope.isDone()).to.be.true
    })

    it('handles other errors', () => {
      const scope = nock('http://localhost:5100')
        .put('/squadron/pilots/Stretch%20%7C%2055FS.json')
        .reply(500, { error: true })

      const result = store.dispatch('renamePilot', {
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      return expect(result).to.be.rejectedWith('Invalid HTTP response: 500').then(() => {
        expect(scope.isDone()).to.be.true
      })
    })
  })
})
