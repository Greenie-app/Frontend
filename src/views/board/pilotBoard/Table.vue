<template>
  <div>
    <p v-if="hasBoardingRate">{{ $t('squadronBoard.boardingRate', [boardingRate]) }}</p>
    <n-data-table
      :columns="columns"
      :data="passes"
      :row-props="rowProps"
      data-cy="pilotBoardTable"
      id="pilot-table"
      :max-height="600"
      :scroll-x="1200"
    />

    <n-modal
      v-model:show="showNotesModal"
      preset="card"
      :title="t('pilotBoard.notesModal.title')"
      style="max-width: 600px"
    >
      <pre class="notes-content">{{ selectedNotes }}</pre>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { NDataTable, NButton, NModal } from 'naive-ui'
import { isEmpty, isNull } from 'lodash-es'
import { DateTime } from 'luxon'
import numeral from 'numeral'
import type { DataTableColumns } from 'naive-ui'
import { variant } from '@/config/utils'
import { scoreFilter } from '@/config/filters'
import { Pass, Squadron } from '@/types'
import { usePilotDataStore } from '@/stores/pilotData'

interface Props {
  squadron: Squadron
  pilot: string
}

defineProps<Props>()
const { t } = useI18n()
const pilotDataStore = usePilotDataStore()

const passes = computed(() => pilotDataStore.pilotData?.passes || [])

const hasBoardingRate = computed(() => !isEmpty(passes.value))

const boardingRate = computed(() => {
  if (!pilotDataStore.pilotData) return '0.00'
  return numeral(pilotDataStore.pilotData.boardingRate).format('0.00')
})

const showNotesModal = ref(false)
const selectedNotes = ref('')

function openNotesModal(notes: string | null) {
  selectedNotes.value = notes || ''
  showNotesModal.value = true
}

function formatTime(time: DateTime): string {
  return time.toLocaleString({
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: 'UTC',
  })
}

const columns = computed<DataTableColumns<Pass>>(() => [
  {
    key: 'time',
    title: t('pilotBoard.tableHeaders.time'),
    render: (row) => t('pilotBoard.zuluTime', { time: formatTime(row.time) }),
  },
  {
    key: 'shipName',
    title: t('pilotBoard.tableHeaders.shipName'),
  },
  {
    key: 'aircraftType',
    title: t('pilotBoard.tableHeaders.aircraftType'),
  },
  {
    key: 'grade',
    title: t('pilotBoard.tableHeaders.grade'),
    render: (row) => (row.grade ? t(`pass.grade.${row.grade}`) : ''),
  },
  {
    key: 'score',
    title: t('pilotBoard.tableHeaders.score'),
    render: (row) => (row.score !== null ? scoreFilter(row.score) : ''),
  },
  {
    key: 'wire',
    title: t('pilotBoard.tableHeaders.wire'),
  },
  {
    key: 'notes',
    title: t('pilotBoard.tableHeaders.notes'),
    render: (row) =>
      row.notes
        ? h(
            NButton,
            {
              text: true,
              type: 'primary',
              onClick: () => openNotesModal(row.notes),
            },
            { default: () => t('pilotBoard.showNotes') },
          )
        : '',
  },
])

function rowProps(row: Pass) {
  const color = variant(row)
  if (isNull(color)) return {}

  const colorMap: Record<string, string> = {
    success: '#d4edda',
    warning: '#fff3cd',
    danger: '#f8d7da',
  }

  return {
    style: {
      backgroundColor: colorMap[color] || 'transparent',
    },
  }
}
</script>

<style scoped>
#pilot-table :deep(td),
#pilot-table :deep(td *) {
  white-space: nowrap;
}

.notes-content {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin: 0;
}
</style>
