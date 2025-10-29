import { mount } from '@vue/test-utils'
import { DateTime } from 'luxon'
import {
  describe, it, beforeEach, expect
} from 'vitest'
import Datetime from '@/components/Datetime.vue'

// Type for exposed properties from defineExpose - refs are unwrapped
type DatetimeExposed = {
  dateValue: string | null;
  timeValue: string | null;
  datetimeValue: DateTime | null;
}

describe('Datetime.vue', () => {
  let wrapper: ReturnType<typeof mount<typeof Datetime>>

  beforeEach(() => {
    wrapper = mount(Datetime, {
      props: {
        modelValue: DateTime.fromSQL('2020-06-03 01:15:41.653000', { zone: 'UTC' }),
        name: 'squadron[time]',
        id: 'squadron-time'
      }
    })
  })

  it('sets dateValue and timeValue to the proper UTC representation', () => {
    const exposed = wrapper.vm as unknown as DatetimeExposed
    expect(exposed.dateValue).toEqual('2020-06-03')
    expect(exposed.timeValue).toEqual('01:15:41')
  })

  it('converts strings back to a DateTime', () => {
    const exposed = wrapper.vm as unknown as DatetimeExposed
    expect(exposed.datetimeValue?.toSQL()).toEqual('2020-06-03 01:15:41.000 Z')
  })
})
