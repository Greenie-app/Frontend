import { shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
import { componentLocalVue } from '../../../../utils'
import Form from '@/views/board/squadronBoard/modals/Form.vue'
import { Grade } from '@/types'
import i18n from '@/i18n'
import store from '@/store'

describe('squadronBoard/Form.vue', () => {
  it('automatically sets the wire and score when the grade is changed', () => {
    const wrapper = shallowMount(Form, {
      localVue: componentLocalVue(),
      propsData: {
        pass: {},
        submitString: 'addPassModal.submitButton'
      },
      i18n,
      store
    })
    const vue: Form = wrapper.vm

    vue.pass.grade = Grade.Cut
    vue.onGradeChanged()
    expect(vue.pass.score).to.eql(0)
    expect(vue.pass.trap).to.be.true

    vue.pass.wire = 2
    vue.pass.grade = Grade.Bolter
    vue.onGradeChanged()
    expect(vue.pass.score).to.eql(2.5)
    expect(vue.pass.trap).to.be.false
    expect(vue.pass.wire).to.be.null

    vue.pass.grade = Grade.Perfect
    vue.onGradeChanged()
    expect(vue.pass.score).to.eql(5.0)
    expect(vue.pass.trap).to.be.true
    expect(vue.pass.wire).to.eql(3)
  })
})
