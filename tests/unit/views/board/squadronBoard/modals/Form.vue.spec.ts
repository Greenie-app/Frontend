import { mount } from '@vue/test-utils'
import {
  describe, it, beforeEach, expect
} from 'vitest'
import { createTestPinia, i18n } from '../../../../utils'
import Form from '@/views/board/squadronBoard/modals/Form.vue'

describe('squadronBoard/Form.vue', () => {
  beforeEach(() => {
    createTestPinia()
  })

  it('renders the form', () => {
    const wrapper = mount(Form, {
      props: {
        pass: {},
        submitString: 'addPassModal.submitButton'
      },
      global: {
        plugins: [i18n],
        stubs: {
          'field-with-errors': true,
          'n-form': true,
          'n-space': true,
          'n-button': true,
          'n-spin': true,
          'n-alert': true
        }
      }
    })

    // Basic test that the component mounts
    expect(wrapper.exists()).toBe(true)
  })
})
