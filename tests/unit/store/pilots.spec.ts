import { Store } from 'vuex'
import { expect } from 'chai'
import { createTestStore } from '../utils'
import { mockServer } from '../setup'
import passesJSON from '../../fixtures/passes.txt.json'
import { PassesState, RootState } from '@/store/types'
import { passFromJSON, PassJSONDown } from '@/store/coding'

describe('Vuex: pilots', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    store.commit('FINISH_PASSES', {
      passes: JSON.parse(passesJSON).map((p: PassJSONDown) => passFromJSON(p))
    })
  })

  describe('#renamePilot', () => {
    it('renames a pilot', async () => {
      await mockServer.put('/squadron/pilots/Stretch%20%7C%2055FS.json').thenReply(200, '{"ok":true}')
      const result = await store.dispatch('renamePilot', {
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result.ok).to.be.true
      const state = (<RootState & { passes: PassesState }>store.state).passes
      expect(state.passes?.filter(p => p.pilot === 'Stretch')?.map(p => p.ID))
        .to.deep.equalInAnyOrder([11, 4])
    })

    it('handles validation errors', async () => {
      await mockServer.put('/squadron/pilots/Stretch%20%7C%2055FS.json').thenReply(
        422,
        JSON.stringify({ errors: { name: ['must be present'] } })
      )
      const result = await store.dispatch('renamePilot', {
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result.ok).to.be.false
      expect(result.val).to.eql({ name: ['must be present'] })
    })

    it('handles other errors', done => {
      mockServer.put('/squadron/pilots/Stretch%20%7C%2055FS.json').thenReply(500, '{"error":true}').then(() => {
        const result = store.dispatch('renamePilot', {
          oldName: 'Stretch | 55FS',
          newName: 'Stretch'
        })
        expect(result).to.be.rejectedWith('Invalid HTTP response: 500').and.notify(done)
      })
    })
  })
})
