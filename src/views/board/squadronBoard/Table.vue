<template>
  <div class="squadron-table-wrapper">
    <div class="squadron-table" :style="{ '--max-passes': passesStore.maxPassesForPilot }">
      <template v-for="[pilot, passes] in passesStore.passesByPilot" :key="pilot ?? 'unknown'">
        <div class="header-cell" data-cy="squadronBoardRow" :data-cy-pilot="dataCy(pilot)">
          <pass-header-cell :average="average(pilot, passes)" :pilot="pilot" />
        </div>
        <div
          class="pass-cell-wrapper"
          v-for="pass in passes"
          :key="pass.ID"
          :data-cy-pilot="dataCy(pilot)"
        >
          <pass-cell :pass="pass" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty, isNull, sumBy } from 'lodash-es'
import { usePassesStore } from '@/stores/passes'
import { Pass } from '@/types'
import PassHeaderCell from '@/views/board/squadronBoard/table/PassHeaderCell.vue'
import PassCell from '@/views/board/squadronBoard/table/PassCell.vue'

const passesStore = usePassesStore()

function average(pilot: string | null, passes: Pass[]): number | null {
  if (isNull(pilot)) return null
  const scoredPasses = passes.filter((p) => !isNull(p.score))
  if (isEmpty(scoredPasses)) return null
  return sumBy(scoredPasses, (p) => p.score!) / scoredPasses.length
}

function dataCy(pilot: string | null): string {
  return isNull(pilot) ? 'unknown' : pilot.replace(/\s+/g, '')
}

defineExpose({
  average,
})
</script>

<style scoped>
.squadron-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.squadron-table {
  display: grid;
  grid-template-columns: min-content repeat(var(--max-passes), 100px);
  gap: 0.5rem;
  width: fit-content;
}

.squadron-table .header-cell {
  grid-column: 1;
}
</style>
