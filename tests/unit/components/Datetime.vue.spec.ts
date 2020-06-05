import { shallowMount, Wrapper } from '@vue/test-utils'
import { DateTime } from 'luxon'
import { expect } from 'chai'
import { componentLocalVue } from '../utils'
import Datetime from '@/components/Datetime.vue'

describe('Datetime.vue', () => {
  let wrapper: Wrapper<Datetime>

  beforeEach(() => {
    wrapper = shallowMount(Datetime, {
      localVue: componentLocalVue(),
      propsData: {
        value: DateTime.fromSQL('2020-06-03 01:15:41.653000', { zone: 'UTC' }),
        name: 'squadron[time]',
        id: 'squadron-time'
      }
    })
  })

  it('sets dateValue and timeValue to the proper UTC representation', () => {
    expect(wrapper.vm.dateValue).to.eql('2020-06-03')
    expect(wrapper.vm.timeValue).to.eql('01:15:41')
  })

  it('converts strings back to a DateTime', () => {
    expect(wrapper.vm.datetimeValue?.toSQL()).to.eql('2020-06-03 01:15:41.000 Z')
  })
})
