import { describe, it, beforeEach, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { createTestPinia } from '../utils'
import backend from '../backend'
import { usePilotDataStore } from '@/stores/pilotData'

describe('Vuex: pilotData', () => {
  let pilotDataStore: ReturnType<typeof usePilotDataStore>

  beforeEach(() => {
    createTestPinia()
    pilotDataStore = usePilotDataStore()
  })

  describe('actions', () => {
    describe('#loadPilotData', () => {
      it('loads pilot data', async () => {
        await pilotDataStore.loadPilotData({
          squadron: '72nd',
          pilot: 'Jambo72nd'
        })

        expect(pilotDataStore.pilotData).not.toBeNull()
        expect(pilotDataStore.pilotData?.pilot.name).toEqual('Jambo72nd')
        expect(pilotDataStore.pilotDataLoading).toBe(false)
        expect(pilotDataStore.pilotDataError).toBeNull()
      })

      it('loads passes for the pilot', async () => {
        await pilotDataStore.loadPilotData({
          squadron: '72nd',
          pilot: 'Jambo72nd'
        })

        expect(pilotDataStore.pilotData?.passes.length).toBeGreaterThan(0)
        // All passes should be for the pilot
        pilotDataStore.pilotData?.passes.forEach((pass) => {
          expect(pass.pilot).toEqual('Jambo72nd')
        })
      })

      it('stores boarding rate from response', async () => {
        await pilotDataStore.loadPilotData({
          squadron: '72nd',
          pilot: 'Jambo72nd'
        })

        expect(pilotDataStore.pilotData?.boardingRate).toEqual(0.75)
      })

      it('stores error statistics from response', async () => {
        await pilotDataStore.loadPilotData({
          squadron: '72nd',
          pilot: 'Jambo72nd'
        })

        expect(pilotDataStore.pilotData?.errorStatistics).toBeDefined()
        expect(pilotDataStore.pilotData?.errorStatistics.length).toEqual(2)

        const lulStat = pilotDataStore.pilotData?.errorStatistics.find((s) => s.code === 'LUL')
        expect(lulStat).toBeDefined()
        expect(lulStat?.description).toEqual('Lined up left')
        expect(lulStat?.score).toEqual(4.0)
        expect(lulStat?.count).toEqual(2)

        const fStat = pilotDataStore.pilotData?.errorStatistics.find((s) => s.code === 'F')
        expect(fStat).toBeDefined()
        expect(fStat?.description).toEqual('Fast')
        expect(fStat?.score).toEqual(2.0)
        expect(fStat?.count).toEqual(1)
      })

      it('handles errors', async () => {
        backend.use(
          http.get('http://localhost:5100/squadrons/72nd/pilots/NotFound.json', () =>
            HttpResponse.json({ error: 'not_found' }, { status: 404 })
          )
        )

        await pilotDataStore.loadPilotData({
          squadron: '72nd',
          pilot: 'NotFound'
        })

        expect(pilotDataStore.pilotDataLoading).toBe(false)
        expect(pilotDataStore.pilotDataError?.message).toEqual('Invalid HTTP response: 404')
      })

      it('encodes pilot name in URL', async () => {
        backend.use(
          http.get('http://localhost:5100/squadrons/72nd/pilots/Pilot%20Name.json', () =>
            HttpResponse.json({
              pilot: { name: 'Pilot Name' },
              passes: [],
              boarding_rate: 0.0,
              error_statistics: []
            })
          )
        )

        await pilotDataStore.loadPilotData({
          squadron: '72nd',
          pilot: 'Pilot Name'
        })

        expect(pilotDataStore.pilotData?.pilot.name).toEqual('Pilot Name')
      })
    })

    describe('#resetPilotData', () => {
      it('resets pilot data', async () => {
        await pilotDataStore.loadPilotData({
          squadron: '72nd',
          pilot: 'Jambo72nd'
        })

        expect(pilotDataStore.pilotData).not.toBeNull()

        pilotDataStore.resetPilotData()

        expect(pilotDataStore.pilotData).toBeNull()
        expect(pilotDataStore.pilotDataError).toBeNull()
        expect(pilotDataStore.pilotDataLoading).toBe(false)
      })
    })

    describe('date range helpers', () => {
      it('setLast4Weeks sets correct range', () => {
        pilotDataStore.setLast4Weeks()

        const now = new Date()
        const start = pilotDataStore.startDate.toJSDate()
        const end = pilotDataStore.endDate.toJSDate()

        // Start should be about 4 weeks ago
        const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
        expect(start.toDateString()).toEqual(fourWeeksAgo.toDateString())
        expect(end.toDateString()).toEqual(now.toDateString())
      })

      it('setCurrentMonth sets correct range', () => {
        pilotDataStore.setCurrentMonth()

        const now = new Date()
        const start = pilotDataStore.startDate.toJSDate()
        const end = pilotDataStore.endDate.toJSDate()

        // Start should be first of current month
        expect(start.getDate()).toEqual(1)
        expect(start.getMonth()).toEqual(now.getMonth())
        expect(end.toDateString()).toEqual(now.toDateString())
      })
    })
  })
})
