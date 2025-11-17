import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { NConfigProvider } from 'naive-ui'
import { h } from 'vue'
import { createTestPinia, i18n } from '../../../utils'
import ErrorStatistics from '@/views/board/pilotBoard/ErrorStatistics.vue'
import type { ErrorStatistics as ErrorStatisticsType } from '@/types'

describe('ErrorStatistics', () => {
  beforeEach(() => {
    createTestPinia()
  })

  const mountComponent = (errorStats: ErrorStatisticsType) => {
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
    const errorStats: ErrorStatisticsType = {
      overall: [
        { code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 },
        { code: 'F', description: 'Fast', score: 2.0, count: 1 }
      ],
      byPhase: {}
    }

    const wrapper = mountComponent(errorStats)

    expect(wrapper.find('.error-statistics').exists()).toBe(true)
    expect(wrapper.find('[data-cy="errorStatisticsOverallTable"]').exists()).toBe(true)
  })

  it('does not render when no errors', () => {
    const errorStats: ErrorStatisticsType = {
      overall: [],
      byPhase: {}
    }
    const wrapper = mountComponent(errorStats)

    expect(wrapper.find('.error-statistics').exists()).toBe(false)
  })

  it('displays error code, description, count, and score', () => {
    const errorStats: ErrorStatisticsType = {
      overall: [{ code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 }],
      byPhase: {}
    }

    const wrapper = mountComponent(errorStats)

    const text = wrapper.text()
    expect(text).toContain('LUL')
    expect(text).toContain('Lined up left')
    expect(text).toContain('2')
    expect(text).toContain('4.0')
  })

  it('renders title', () => {
    const errorStats: ErrorStatisticsType = {
      overall: [{ code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 }],
      byPhase: {}
    }

    const wrapper = mountComponent(errorStats)

    expect(wrapper.find('h3').exists()).toBe(true)
    expect(wrapper.text()).toContain('Error Statistics')
  })

  it('formats score with one decimal place', () => {
    const errorStats: ErrorStatisticsType = {
      overall: [{ code: 'LUL', description: 'Lined up left', score: 3.5, count: 2 }],
      byPhase: {}
    }

    const wrapper = mountComponent(errorStats)

    expect(wrapper.text()).toContain('3.5')
  })

  it('renders errors grouped by phase', () => {
    const errorStats: ErrorStatisticsType = {
      overall: [{ code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 }],
      byPhase: {
        X: {
          phaseDescription: 'At the start',
          errors: [{ code: 'LUL', description: 'Lined up left', score: 2.0, count: 1 }]
        },
        IM: {
          phaseDescription: 'In the middle',
          errors: [{ code: 'F', description: 'Fast', score: 2.0, count: 1 }]
        }
      }
    }

    const wrapper = mountComponent(errorStats)

    const text = wrapper.text()
    expect(text).toContain('At the start')
    expect(text).toContain('In the middle')
    expect(wrapper.find('[data-cy="errorStatisticsXTable"]').exists()).toBe(true)
    expect(wrapper.find('[data-cy="errorStatisticsIMTable"]').exists()).toBe(true)
  })

  it('displays Overall section header', () => {
    const errorStats: ErrorStatisticsType = {
      overall: [{ code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 }],
      byPhase: {}
    }

    const wrapper = mountComponent(errorStats)

    expect(wrapper.text()).toContain('Overall')
  })

  it('does not render phase section when no phase errors', () => {
    const errorStats: ErrorStatisticsType = {
      overall: [{ code: 'LUL', description: 'Lined up left', score: 4.0, count: 2 }],
      byPhase: {}
    }

    const wrapper = mountComponent(errorStats)

    expect(wrapper.find('[data-cy="errorStatisticsXTable"]').exists()).toBe(false)
    expect(wrapper.find('[data-cy="errorStatisticsIMTable"]').exists()).toBe(false)
  })
})
