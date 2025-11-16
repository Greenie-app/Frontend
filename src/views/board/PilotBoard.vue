<template>
  <error v-if="pilotDataStore.pilotDataError" :error="pilotDataStore.pilotDataError.message" />

  <n-space vertical v-else-if="pilotDataLoaded">
    <pilot-header :pilot="pilot" :squadron="rootStore.squadron!" />

    <date-range-filter :pilot="pilot" />

    <p v-if="noPasses">
      {{ $t("pilotBoard.noPassesInRange") }}
    </p>
    <template v-else>
      <pilot-table :pilot="pilot" :squadron="rootStore.squadron!" />
      <error-statistics :error-statistics="pilotDataStore.pilotData!.errorStatistics" />
    </template>
  </n-space>

  <spinner v-else />
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { NSpace } from "naive-ui";
import { isEmpty, isNull } from "lodash-es";
import { useRootStore } from "@/stores/root";
import { usePilotDataStore } from "@/stores/pilotData";
import Error from "@/components/Error.vue";
import Spinner from "@/components/Spinner.vue";
import PilotTable from "@/views/board/pilotBoard/Table.vue";
import PilotHeader from "@/views/board/pilotBoard/Header.vue";
import DateRangeFilter from "@/views/board/pilotBoard/DateRangeFilter.vue";
import ErrorStatistics from "@/views/board/pilotBoard/ErrorStatistics.vue";

const route = useRoute();
const rootStore = useRootStore();
const pilotDataStore = usePilotDataStore();

const pilot = computed(() => route.params.pilot as string);

const pilotDataLoaded = computed(
  () =>
    !isNull(pilotDataStore.pilotData) &&
    !pilotDataStore.pilotDataLoading &&
    isNull(pilotDataStore.pilotDataError),
);

const noPasses = computed(() =>
  pilotDataStore.pilotData ? isEmpty(pilotDataStore.pilotData.passes) : true,
);

// Load pilot data when component mounts
onMounted(() => {
  if (
    rootStore.squadron &&
    pilot.value &&
    !pilotDataStore.pilotDataLoading &&
    !pilotDataStore.pilotData
  ) {
    pilotDataStore.loadPilotData({
      squadron: rootStore.squadron.username,
      pilot: pilot.value,
      dateRange: {
        start: pilotDataStore.startDate,
        end: pilotDataStore.endDate,
      },
    });
  }
});

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
      });
    }
  },
);
</script>
