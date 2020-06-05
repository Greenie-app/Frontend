import { shallowMount } from '@vue/test-utils'
import { Err, Ok } from 'ts-results'
import { expect } from 'chai'
import { componentLocalVue } from '../../utils'
import { getSandbox } from '../../setup'
import i18n from '@/i18n'
import ResetPassword from '@/views/account/ResetPassword.vue'

describe('ResetPassword.vue', () => {
  describe('#onSubmit', () => {
    it('displays the success message on success', async () => {
      const routerSpy = getSandbox().stub().resolves()
      const wrapper = shallowMount(ResetPassword, {
        localVue: componentLocalVue(),
        mocks: {
          $router: { push: routerSpy },
          $route: { params: { token: 'abc123' } }
        },
        i18n
      })
      const vue: ResetPassword = wrapper.vm
      getSandbox().stub(vue, 'resetPassword').resolves(new Ok(undefined))
      const modalSpy = getSandbox().stub(vue.$bvModal, 'msgBoxOk').resolves()

      await vue.onSubmit()

      expect(modalSpy).to.have.been.calledOnceWith('Your password has been reset. Please log in again.')
      expect(routerSpy).to.have.been.calledOnceWith({ name: 'Home' })
    })

    it('displays the bad token on bad token', async () => {
      const routerSpy = getSandbox().stub().resolves()
      const wrapper = shallowMount(ResetPassword, {
        localVue: componentLocalVue(),
        mocks: {
          $router: { push: routerSpy },
          $route: { params: { token: 'abc123' } }
        },
        i18n
      })
      const vue: ResetPassword = wrapper.vm
      getSandbox().stub(vue, 'resetPassword').resolves(new Err({ reset_password_token: ['invalid'] }))
      const modalSpy = getSandbox().stub(vue.$bvModal, 'msgBoxOk').resolves()

      await vue.onSubmit()

      expect(modalSpy).to.have.been.calledOnceWith('The Reset Password link you used is invalid or expired.')
      expect(routerSpy).to.have.been.calledOnceWith({ name: 'Home' })
    })

    it('sets the form error otherwise', async () => {
      const routerSpy = getSandbox().stub().resolves()
      const wrapper = shallowMount(ResetPassword, {
        localVue: componentLocalVue(),
        mocks: {
          $router: { push: routerSpy },
          $route: { params: { token: 'abc123' } }
        },
        i18n
      })
      const vue: ResetPassword = wrapper.vm
      getSandbox().stub(vue, 'resetPassword').resolves(new Err({ new_password: ['invalid'] }))
      const modalSpy = getSandbox().stub(vue.$bvModal, 'msgBoxOk').resolves()

      await vue.onSubmit()

      expect(vue.formErrors).to.eql({ new_password: ['invalid'] })
      expect(modalSpy).not.to.have.been.called
      expect(routerSpy).not.to.have.been.called
    })
  })
})
