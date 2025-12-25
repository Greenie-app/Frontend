<template>
  <n-space align="center" :wrap-item="false">
    <n-date-picker
      v-model:value="dateRange"
      type="daterange"
      :shortcuts="shortcuts"
      :disabled="pilotDataStore.pilotDataLoading"
      @confirm="handleDateRangeConfirm"
    />
    <slot name="actions" />
  </n-space>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NDatePicker, NSpace } from 'naive-ui'
import { DateTime } from 'luxon'
import { usePilotDataStore } from '@/stores/pilotData'
import { useRootStore } from '@/stores/root'
import { isNull } from 'lodash-es'

interface Props {
  pilot: string
}

const props = defineProps<Props>()

const pilotDataStore = usePilotDataStore()
const rootStore = useRootStore()

// Local state for the date picker - separate from the store
// This allows users to edit dates without triggering loads until they confirm
const dateRange = ref<[number, number]>([
  pilotDataStore.startDate.toMillis(),
  pilotDataStore.endDate.toMillis(),
])

// Sync local state when store changes (e.g., after a load completes)
watch(
  () => [pilotDataStore.startDate, pilotDataStore.endDate],
  ([newStart, newEnd]) => {
    if (
      newStart instanceof DateTime &&
      newEnd instanceof DateTime &&
      newStart.isValid &&
      newEnd.isValid
    ) {
      dateRange.value = [newStart.toMillis(), newEnd.toMillis()]
    }
  },
)

// Define shortcuts for quick date selections
const shortcuts = {
  'Last 4 Weeks': (): [number, number] => {
    const now = Date.now()
    const fourWeeksAgo = now - 28 * 24 * 60 * 60 * 1000
    return [fourWeeksAgo, now]
  },
  'Current Month': (): [number, number] => {
    const now = DateTime.now()
    return [now.startOf('month').toMillis(), now.endOf('day').toMillis()]
  },
  'Past Month': (): [number, number] => {
    const lastMonth = DateTime.now().minus({ months: 1 })
    return [lastMonth.startOf('month').toMillis(), lastMonth.endOf('month').toMillis()]
  },
  'Current Week': (): [number, number] => {
    const now = DateTime.now()
    return [now.startOf('week').toMillis(), now.endOf('day').toMillis()]
  },
  'Past Week': (): [number, number] => {
    const lastWeek = DateTime.now().minus({ weeks: 1 })
    return [lastWeek.startOf('week').toMillis(), lastWeek.endOf('week').toMillis()]
  },
}

const handleDateRangeConfirm = (value: [number, number] | null) => {
  if (value && !isNull(rootStore.squadron)) {
    const [start, end] = value
    const newStart = DateTime.fromMillis(start).startOf('day')
    const newEnd = DateTime.fromMillis(end).endOf('day')

    // Only reload if the dates have actually changed
    const startChanged = !pilotDataStore.startDate.equals(newStart)
    const endChanged = !pilotDataStore.endDate.equals(newEnd)

    if (startChanged || endChanged) {
      pilotDataStore.loadPilotData({
        squadron: rootStore.squadron.username,
        pilot: props.pilot,
        dateRange: {
          start: newStart,
          end: newEnd,
        },
      })
    }
  }
}
</script>
