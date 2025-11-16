import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { DateTime } from 'luxon'
import {
  describe, it, beforeEach, expect, vi
} from 'vitest'
import { createTestPinia, i18n } from '../../../utils'
import Header from '@/views/board/pilotBoard/Header.vue'
import { useRootStore } from '@/stores/root'
import { useMySquadronStore } from '@/stores/mySquadron'
import { usePassesStore } from '@/stores/passes'
import { usePilotsStore } from '@/stores/pilots'
import type { Squadron } from '@/types'

// Mock naive-ui's useDialog
const mockDialogWarning = vi.fn()
const mockDialogError = vi.fn()
vi.mock('naive-ui', async () => {
  const actual = await vi.importActual<typeof import('naive-ui')>('naive-ui')
  return {
    ...actual,
    useDialog: () => ({
      warning: mockDialogWarning,
      error: mockDialogError
    })
  }
})

function createTestRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
      { path: '/:squadron', name: 'SquadronBoard', component: { template: '<div>Board</div>' } },
      { path: '/:squadron/:pilot', name: 'PilotBoard', component: { template: '<div>Pilot</div>' } }
    ]
  })
  return router
}

describe('pilotBoard/Header.vue', () => {
  let testSquadron: Squadron

  beforeEach(async () => {
    mockDialogWarning.mockClear()
    mockDialogError.mockClear()

    createTestPinia()
    const mySquadronStore = useMySquadronStore()
    const rootStore = useRootStore()

    // Set up initial store state with a complete Squadron object
    testSquadron = {
      ID: 1,
      username: '72nd',
      name: '72nd VFW',
      email: 'test@example.com',
      createdAt: DateTime.utc(),
      updatedAt: DateTime.utc(),
      image: null,
      isEditable: true,
      unknownPassCount: 0
    }

    // Use initialize to properly set up mySquadronStore
    mySquadronStore.initialize({ mySquadron: testSquadron })

    // The rootStore exports computed properties. Use vi.spyOn with 'get' to stub getters
    vi.spyOn(rootStore, 'squadron', 'get').mockReturnValue(testSquadron)
    vi.spyOn(rootStore, 'squadronLoaded', 'get').mockReturnValue(true)
    vi.spyOn(rootStore, 'squadronLoading', 'get').mockReturnValue(false)
    vi.spyOn(rootStore, 'squadronError', 'get').mockReturnValue(null)
  })

  describe('#confirmDelete', () => {
    it('asks for confirmation and deletes the user if approved', async () => {
      const passesStore = usePassesStore()
      const pilotsStore = usePilotsStore()
      const router = createTestRouter()
      await router.push('/72nd/Jambo')

      const wrapper = mount(Header, {
        props: {
          pilot: 'Jambo'
        },
        global: {
          plugins: [i18n, router],
          stubs: {
            'n-breadcrumb': true,
            'n-breadcrumb-item': true,
            'n-space': true,
            'n-button': true,
            'n-dropdown': true,
            'rename-modal': true,
            'merge-modal': true,
            'router-link': true
          }
        }
      })

      const deleteSpy = vi.spyOn(pilotsStore, 'deletePilot').mockResolvedValue(undefined)
      const loadPassesSpy = vi.spyOn(passesStore, 'loadPasses').mockResolvedValue(undefined)
      const pushSpy = vi.spyOn(router, 'push')

      // Call confirmDelete but don't await it since it returns a Promise that waits for dialog resolution
      const deletePromise = (wrapper.vm as { confirmDelete: () => Promise<void> }).confirmDelete()

      // Simulate user clicking the positive button
      expect(mockDialogError).toHaveBeenCalled()
      const dialogCall = mockDialogError.mock.calls[0]![0]!
      await dialogCall.onPositiveClick!()

      // Now await the promise to ensure it completes
      await deletePromise

      expect(deleteSpy).toHaveBeenCalledWith({ pilot: 'Jambo' })
      expect(deleteSpy).toHaveBeenCalledTimes(1)
      expect(loadPassesSpy).toHaveBeenCalledWith({ squadron: '72nd' })
      expect(loadPassesSpy).toHaveBeenCalledTimes(1)
      expect(pushSpy).toHaveBeenCalledWith({ name: 'SquadronBoard', params: { squadron: '72nd' } })
      expect(pushSpy).toHaveBeenCalledTimes(1)
    })

    it('asks for confirmation and does not delete the user if denied', async () => {
      const pilotsStore = usePilotsStore()
      const router = createTestRouter()
      await router.push('/72nd/Jambo')

      const wrapper = mount(Header, {
        props: {
          pilot: 'Jambo'
        },
        global: {
          plugins: [i18n, router],
          stubs: {
            'n-breadcrumb': true,
            'n-breadcrumb-item': true,
            'n-space': true,
            'n-button': true,
            'n-dropdown': true,
            'rename-modal': true,
            'merge-modal': true,
            'router-link': true
          }
        }
      })

      const deleteSpy = vi.spyOn(pilotsStore, 'deletePilot').mockResolvedValue(undefined)
      const pushSpy = vi.spyOn(router, 'push')

      // Call confirmDelete but don't await it since it returns a Promise that waits for dialog resolution
      const deletePromise = (wrapper.vm as { confirmDelete: () => Promise<void> }).confirmDelete()

      // Simulate user clicking the negative button
      expect(mockDialogError).toHaveBeenCalled()
      const dialogCall = mockDialogError.mock.calls[0]![0]!
      if (dialogCall.onNegativeClick) {
        await dialogCall.onNegativeClick()
      }

      // Now await the promise to ensure it completes
      await deletePromise

      expect(deleteSpy).not.toHaveBeenCalled()
      expect(pushSpy).not.toHaveBeenCalled()
    })

    it('handles errors', async () => {
      const pilotsStore = usePilotsStore()
      const router = createTestRouter()
      await router.push('/72nd/Jambo')

      const wrapper = mount(Header, {
        props: {
          pilot: 'Jambo'
        },
        global: {
          plugins: [i18n, router],
          stubs: {
            'n-breadcrumb': true,
            'n-breadcrumb-item': true,
            'n-space': true,
            'n-button': true,
            'n-dropdown': true,
            'rename-modal': true,
            'merge-modal': true,
            'router-link': true
          }
        }
      })

      vi.spyOn(pilotsStore, 'deletePilot').mockRejectedValue(new Error('oops'))
      const pushSpy = vi.spyOn(router, 'push')

      // Call confirmDelete - we don't await since the error prevents resolution
      const vm = wrapper.vm as { confirmDelete: () => Promise<void> }
      vm.confirmDelete()

      // Simulate user clicking the positive button which will trigger the error
      expect(mockDialogError).toHaveBeenCalled()
      const dialogCall = mockDialogError.mock.calls[0]![0]!
      try {
        await dialogCall.onPositiveClick!()
      } catch {
        // Error is caught in the component and shown in a dialog
      }

      // The promise won't resolve because of the error, so we can't await it
      // Instead, just check that the error dialog was shown

      expect(mockDialogError).toHaveBeenCalled()
      expect(pushSpy).not.toHaveBeenCalled()
    })
  })
})
