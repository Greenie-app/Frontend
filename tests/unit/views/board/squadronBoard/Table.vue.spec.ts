import { mount } from '@vue/test-utils'
import {
  describe, it, beforeEach, expect
} from 'vitest'
import { DateTime } from 'luxon'
import { createTestPinia, i18n } from '../../../utils'
import Table from '@/views/board/squadronBoard/Table.vue'
import { usePassesStore } from '@/stores/passes'
import type { Pass } from '@/types'

describe('Table.vue', () => {
  beforeEach(() => {
    createTestPinia()
  })

  describe('#average', () => {
    it('returns the average score for a player', () => {
      const testTime = DateTime.now()
      const testPasses: Pass[] = [
        { ID: 1, score: 1.0, pilot: 'Maverick', time: testTime, shipName: null, aircraftType: null, grade: null, trap: null, wire: null, notes: null },
        { ID: 2, score: 2.0, pilot: 'Maverick', time: testTime, shipName: null, aircraftType: null, grade: null, trap: null, wire: null, notes: null },
        { ID: 3, score: 3.0, pilot: 'Maverick', time: testTime, shipName: null, aircraftType: null, grade: null, trap: null, wire: null, notes: null },
        { ID: 4, score: null, pilot: 'Maverick', time: testTime, shipName: null, aircraftType: null, grade: null, trap: null, wire: null, notes: null }
      ]
      const passesStore = usePassesStore()
      passesStore.$patch({
        passes: testPasses
      })

      const wrapper = mount(Table, {
        global: {
          plugins: [i18n],
          stubs: {
            'pass-header-cell': true,
            'pass-cell': true
          }
        }
      })

      // Test the average function directly
      const avg = wrapper.vm.average('Maverick', testPasses)
      expect(avg).toEqual(2.0)
    })

    it('returns null if there are no scored passes', () => {
      const testTime = DateTime.now()
      const testPasses: Pass[] = [
        { ID: 1, score: null, pilot: 'Maverick', time: testTime, shipName: null, aircraftType: null, grade: null, trap: null, wire: null, notes: null }
      ]
      const passesStore = usePassesStore()
      passesStore.$patch({
        passes: testPasses
      })

      const wrapper = mount(Table, {
        global: {
          plugins: [i18n],
          stubs: {
            'pass-header-cell': true,
            'pass-cell': true
          }
        }
      })

      // Test the average function directly
      const avg = wrapper.vm.average('Maverick', testPasses)
      expect(avg).toBeNull()
    })
  })
})
