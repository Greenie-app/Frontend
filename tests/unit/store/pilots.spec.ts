import { Store } from 'vuex'
import { expect } from 'chai'
import { http, HttpResponse } from 'msw'
import { createTestStore } from '../utils'
import backend from '../backend'
import passesJSON from '../../fixtures/passes.json'
import { PassesState, RootState } from '@/store/types'
import { passFromJSON, PassJSONDown } from '@/store/coding'

describe('Vuex: pilots', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    store.commit('FINISH_PASSES', {
      passes: passesJSON.map(p => passFromJSON(<PassJSONDown>p))
    })
  })

  describe('#renamePilot', () => {
    it('renames a pilot', async () => {
      const result = await store.dispatch('renamePilot', {
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result.ok).to.be.true
      const state = (<RootState & { passes: PassesState }>store.state).passes
      expect(state.passes?.filter(p => p.pilot === 'Stretch')?.map(p => p.ID)).
        to.deep.equalInAnyOrder([11, 4])
    })

    it('handles validation errors', async () => {
      backend.use(
        http.put('http://localhost:5100/squadron/pilots/Stretch%20%7C%2055FS.json', () => HttpResponse.json(
          { errors: { name: ['must be present'] } },
          { status: 422 }
        ))
      )

      const result = await store.dispatch('renamePilot', {
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result.ok).to.be.false
      expect(result.val).to.eql({ name: ['must be present'] })
    })

    it('handles other errors', () => {
      backend.use(
        http.put('http://localhost:5100/squadron/pilots/Stretch%20%7C%2055FS.json', () => HttpResponse.json(
          { error: true },
          { status: 500 }
        ))
      )

      const result = store.dispatch('renamePilot', {
        oldName: 'Stretch | 55FS',
        newName: 'Stretch'
      })

      expect(result).to.be.rejectedWith('Invalid HTTP response: 500')
    })
  })
})
