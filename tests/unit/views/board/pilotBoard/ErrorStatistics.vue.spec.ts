import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { NConfigProvider } from 'naive-ui'
import { h } from 'vue'
import { createTestPinia, i18n } from '../../../utils'
import ErrorStatistics from '@/views/board/pilotBoard/ErrorStatistics.vue'
import type { ErrorStatistic } from '@/types'

describe('ErrorStatistics', () => {
  beforeEach(() => {
    createTestPinia()
  })

  const mountComponent = (errorStats: ErrorStatistic[]) => {
    return mount(NConfigProvider, {
      slots: {
        default: () => h(ErrorStatistics, { errorStatistics: errorStats })
      },
      global: {
        plugins: [i18n]
      }
    })
  }

  it('renders error statistics table when errors exist', () => {
    const errorStats: ErrorStatistic[] = [
      { code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 },
      { code: 'F', description: 'Fast', score: 2.0, count: 1 }
    ]

    const wrapper = mountComponent(errorStats)

    expect(wrapper.find('.error-statistics').exists()).toBe(true)
    expect(wrapper.find('[data-cy="errorStatisticsTable"]').exists()).toBe(true)
  })

  it('does not render when no errors', () => {
    const wrapper = mountComponent([])

    expect(wrapper.find('.error-statistics').exists()).toBe(false)
  })

  it('displays error code, description, count, and score', () => {
    const errorStats: ErrorStatistic[] = [
      { code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 }
    ]

    const wrapper = mountComponent(errorStats)

    const text = wrapper.text()
    expect(text).toContain('LUL')
    expect(text).toContain('Lined up left')
    expect(text).toContain('2')
    expect(text).toContain('4.0')
  })

  it('renders title', () => {
    const errorStats: ErrorStatistic[] = [
      { code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 }
    ]

    const wrapper = mountComponent(errorStats)

    expect(wrapper.find('h3').exists()).toBe(true)
    expect(wrapper.text()).toContain('Error Statistics')
  })

  it('formats score with one decimal place', () => {
    const errorStats: ErrorStatistic[] = [
      { code: 'LUL', description: 'Lined up left', score: 3.5, count: 2 }
    ]

    const wrapper = mountComponent(errorStats)

    expect(wrapper.text()).toContain('3.5')
  })
})
