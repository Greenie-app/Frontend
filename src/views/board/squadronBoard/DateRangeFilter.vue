<template>
  <n-space align="center" :wrap-item="false">
    <n-date-picker
      v-model:value="dateRange"
      type="daterange"
      :shortcuts="shortcuts"
      :disabled="passesStore.passesLoading"
      @confirm="handleDateRangeConfirm"
    />
    <slot name="actions" />
  </n-space>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NDatePicker, NSpace } from 'naive-ui'
import { DateTime } from 'luxon'
import { usePassesStore } from '@/stores/passes'
import { useRootStore } from '@/stores/root'
import { isNull } from 'lodash-es'

const passesStore = usePassesStore()
const rootStore = useRootStore()

// Local state for the date picker - separate from the store
// This allows users to edit dates without triggering loads until they confirm
const dateRange = ref<[number, number]>([
  passesStore.startDate.toMillis(),
  passesStore.endDate.toMillis(),
])

// Sync local state when store changes (e.g., after a load completes)
watch(
  () => [passesStore.startDate, passesStore.endDate],
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
  'Last 4 Weeks': () => {
    const now = Date.now()
    const fourWeeksAgo = now - 28 * 24 * 60 * 60 * 1000
    return [fourWeeksAgo, now]
  },
  'Current Month': () => {
    const now = DateTime.now()
    return [now.startOf('month').toMillis(), now.endOf('day').toMillis()]
  },
  'Past Month': () => {
    const lastMonth = DateTime.now().minus({ months: 1 })
    return [lastMonth.startOf('month').toMillis(), lastMonth.endOf('month').toMillis()]
  },
  'Current Week': () => {
    const now = DateTime.now()
    return [now.startOf('week').toMillis(), now.endOf('day').toMillis()]
  },
  'Past Week': () => {
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
    const startChanged = !passesStore.startDate.equals(newStart)
    const endChanged = !passesStore.endDate.equals(newEnd)

    if (startChanged || endChanged) {
      passesStore.loadPasses({
        squadron: rootStore.squadron.username,
        dateRange: {
          start: newStart,
          end: newEnd,
        },
      })
    }
  }
}
</script>
