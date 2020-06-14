import { shallowMount } from '@vue/test-utils'
import { Ok } from 'ts-results'
import { expect } from 'chai'
import { componentLocalVue } from '../../../utils'
import Form from '@/views/account/changePassword/Form.vue'
import i18n from '@/i18n'

describe('account/changePassword/Form.vue', () => {
  describe('#onSubmit', () => {
    it('resets the password fields on success', () => {
      const wrapper = shallowMount(Form, {
        localVue: componentLocalVue(),
        mocks: {
          changePassword: () => new Ok(undefined)
        },
        i18n
      })
      const vue: Form = wrapper.vm

      vue.onSubmit()

      expect(vue.currentPassword).to.eql('')
      expect(vue.newPassword).to.eql('')
      expect(vue.passwordConfirmation).to.eql('')
    })
  })
})
