import { shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
import { componentLocalVue } from '../../../../utils'
import PassRow from '@/views/board/squadronBoard/table/PassRow.vue'
import store from '@/store'

describe('PassRow.vue', () => {
  describe('#average', () => {
    it('returns the average score for a player', () => {
      const wrapper = shallowMount(PassRow, {
        localVue: componentLocalVue(),
        propsData: {
          pilot: 'Maverick',
          passes: [
            { score: 1.0 },
            { score: 2.0 },
            { score: 3.0 },
            { score: null }
          ]
        },
        store
      })

      const vue: PassRow = wrapper.vm
      expect(vue.average).to.eql(2.0)
    })

    it('returns null if there are no scored passes', () => {
      const wrapper = shallowMount(PassRow, {
        localVue: componentLocalVue(),
        propsData: {
          pilot: 'Maverick',
          passes: [
            { score: null }
          ]
        },
        store
      })

      const vue: PassRow = wrapper.vm
      expect(vue.average).to.be.null
    })
  })
})
