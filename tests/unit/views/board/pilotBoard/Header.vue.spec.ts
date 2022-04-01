import { shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
import { Store } from 'vuex'
import { getSandbox } from '../../../setup'
import { componentLocalVue, createTestStore } from '../../../utils'
import i18n from '@/i18n'
import Header from '@/views/board/pilotBoard/Header.vue'
import { RootState } from '@/store/types'

describe('pilotBoard/Header.vue', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    store.commit('FINISH_SQUADRON', { squadron: { username: '72nd', name: '72nd VFW' } })
  })

  describe('#confirmDelete', () => {
    it('asks for confirmation and deletes the user if approved', async () => {
      const routerSpy = getSandbox().stub().resolves()
      const wrapper = shallowMount(Header, {
        localVue: componentLocalVue(),
        mocks: {
          $router: { push: routerSpy },
          $route: { params: { squadron: '72nd' } },
          mySquadron: { username: '72nd' },
          loadPasses: getSandbox().stub().resolves(),
          pilotNames: ['Stretch']
        },
        propsData: {
          pilot: 'Jambo'
        },
        i18n,
        store
      })
      const vue: Header = wrapper.vm
      const deleteSpy = getSandbox().stub(vue, 'deletePilot').resolves()
      getSandbox().stub(vue.$bvModal, 'msgBoxConfirm').resolves(true)

      await vue.confirmDelete()

      expect(deleteSpy).to.have.been.calledOnceWith({ pilot: 'Jambo' })
      expect(routerSpy).to.have.been.calledOnceWith({ name: 'SquadronBoard', params: { squadron: '72nd' } })
    })

    it('asks for confirmation and does not delete the user if denied', async () => {
      const routerSpy = getSandbox().stub().resolves()
      const wrapper = shallowMount(Header, {
        localVue: componentLocalVue(),
        mocks: {
          $router: { push: routerSpy },
          $route: { params: { squadron: '72nd' } },
          mySquadron: { username: '72nd' },
          loadPasses: getSandbox().stub().resolves(),
          pilotNames: ['Stretch'],
          squadron: { username: '72nd', name: '72nd VFW' }
        },
        propsData: {
          pilot: 'Jambo'
        },
        i18n,
        store
      })
      const vue: Header = wrapper.vm
      const deleteSpy = getSandbox().stub(vue, 'deletePilot').resolves()
      getSandbox().stub(vue.$bvModal, 'msgBoxConfirm').resolves(false)

      await vue.confirmDelete()

      expect(deleteSpy).not.to.have.been.called
      expect(routerSpy).not.to.have.been.called
    })

    it('handles errors', async () => {
      const routerSpy = getSandbox().stub().resolves()
      const wrapper = shallowMount(Header, {
        localVue: componentLocalVue(),
        mocks: {
          $router: { push: routerSpy },
          $route: { params: { squadron: '72nd' } },
          mySquadron: { username: '72nd' },
          loadPasses: getSandbox().stub().resolves(),
          pilotNames: ['Stretch'],
          squadron: { username: '72nd', name: '72nd VFW' }
        },
        propsData: {
          pilot: 'Jambo'
        },
        i18n,
        store
      })
      const vue: Header = wrapper.vm
      getSandbox().stub(vue, 'deletePilot').throws('oops')
      getSandbox().stub(vue.$bvModal, 'msgBoxConfirm').resolves(true)
      const errorStub = getSandbox().stub(vue.$bvModal, 'msgBoxOk').resolves()

      await vue.confirmDelete()

      expect(errorStub).to.have.been.called
      expect(routerSpy).not.to.have.been.called
    })
  })
})
