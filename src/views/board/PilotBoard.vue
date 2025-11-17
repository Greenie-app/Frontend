<template>
  <error v-if="pilotDataStore.pilotDataError" :error="pilotDataStore.pilotDataError.message" />

  <n-space vertical v-else-if="pilotDataLoaded">
    <pilot-header :pilot="pilot" :squadron="rootStore.squadron!" />

    <date-range-filter :pilot="pilot" />

    <p v-if="noPasses">
      {{ $t('pilotBoard.noPassesInRange') }}
    </p>
    <template v-else>
      <pilot-table :pilot="pilot" :squadron="rootStore.squadron!" />
      <error-statistics :error-statistics="pilotDataStore.pilotData!.errorStatistics" />
    </template>
  </n-space>

  <spinner v-else />
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NSpace } from 'naive-ui'
import { isEmpty, isNull } from 'lodash-es'
import { DateTime } from 'luxon'
import { useRootStore } from '@/stores/root'
import { usePilotDataStore } from '@/stores/pilotData'
import Error from '@/components/Error.vue'
import Spinner from '@/components/Spinner.vue'
import PilotTable from '@/views/board/pilotBoard/Table.vue'
import PilotHeader from '@/views/board/pilotBoard/Header.vue'
import DateRangeFilter from '@/views/board/pilotBoard/DateRangeFilter.vue'
import ErrorStatistics from '@/views/board/pilotBoard/ErrorStatistics.vue'

const route = useRoute()
const router = useRouter()
const rootStore = useRootStore()
const pilotDataStore = usePilotDataStore()

const pilot = computed(() => route.params.pilot as string)

const pilotDataLoaded = computed(
  () =>
    !isNull(pilotDataStore.pilotData) &&
    !pilotDataStore.pilotDataLoading &&
    isNull(pilotDataStore.pilotDataError),
)

const noPasses = computed(() =>
  pilotDataStore.pilotData ? isEmpty(pilotDataStore.pilotData.passes) : true,
)

// Parse date range from URL parameters
function getDateRangeFromUrl(): { start: DateTime; end: DateTime } | null {
  const fromParam = route.query.from as string | undefined
  const toParam = route.query.to as string | undefined

  if (fromParam && toParam) {
    const start = DateTime.fromISO(fromParam)
    const end = DateTime.fromISO(toParam)

    if (start.isValid && end.isValid) {
      return { start: start.startOf('day'), end: end.endOf('day') }
    }
  }
  return null
}

// Update URL with current date range
function updateUrlWithDateRange(start: DateTime, end: DateTime) {
  const fromDate = start.toISODate()
  const toDate = end.toISODate()

  if (fromDate && toDate) {
    router.replace({
      query: {
        ...route.query,
        from: fromDate,
        to: toDate,
      },
    })
  }
}

// Load pilot data when component mounts
onMounted(() => {
  // Check for URL parameters first
  const urlDateRange = getDateRangeFromUrl()

  // Update URL with current date range if no parameters were present
  if (!urlDateRange) {
    updateUrlWithDateRange(pilotDataStore.startDate, pilotDataStore.endDate)
  }

  // Load if we have required data and either no data loaded or different pilot
  const needsLoad = !pilotDataStore.pilotData || pilotDataStore.pilotData.pilot.name !== pilot.value

  if (rootStore.squadron && pilot.value && !pilotDataStore.pilotDataLoading && needsLoad) {
    const dateRange = urlDateRange || {
      start: pilotDataStore.startDate,
      end: pilotDataStore.endDate,
    }

    pilotDataStore.loadPilotData({
      squadron: rootStore.squadron.username,
      pilot: pilot.value,
      dateRange,
    })
  }
})

// Watch for pilot changes to reload data
watch(
  () => pilot.value,
  (newPilot, oldPilot) => {
    if (newPilot && newPilot !== oldPilot && rootStore.squadron) {
      pilotDataStore.loadPilotData({
        squadron: rootStore.squadron.username,
        pilot: newPilot,
        dateRange: {
          start: pilotDataStore.startDate,
          end: pilotDataStore.endDate,
        },
      })
    }
  },
)

// Watch for store date changes to update URL
watch(
  () => [pilotDataStore.startDate, pilotDataStore.endDate],
  ([newStart, newEnd]) => {
    if (
      newStart instanceof DateTime &&
      newEnd instanceof DateTime &&
      newStart.isValid &&
      newEnd.isValid
    ) {
      updateUrlWithDateRange(newStart, newEnd)
    }
  },
)
</script>
