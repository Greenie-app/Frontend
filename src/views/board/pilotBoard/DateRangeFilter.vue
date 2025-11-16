<template>
  <n-space align="center" :wrap-item="false">
    <n-date-picker
      v-model:value="dateRange"
      type="daterange"
      :shortcuts="shortcuts"
      :disabled="pilotDataStore.pilotDataLoading"
      @update:value="handleDateRangeChange"
    />
    <slot name="actions" />
  </n-space>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NDatePicker, NSpace } from "naive-ui";
import { DateTime } from "luxon";
import { usePilotDataStore } from "@/stores/pilotData";
import { useRootStore } from "@/stores/root";
import { isNull } from "lodash-es";

interface Props {
  pilot: string;
}

const props = defineProps<Props>();

const pilotDataStore = usePilotDataStore();
const rootStore = useRootStore();

// Convert DateTime to timestamp for Naive UI
const dateRange = computed({
  get: () => {
    const start = pilotDataStore.startDate;
    const end = pilotDataStore.endDate;

    if (!start || !end) {
      const now = DateTime.now();
      return [now.minus({ weeks: 4 }).startOf("day").toMillis(), now.endOf("day").toMillis()] as [
        number,
        number,
      ];
    }

    if (!(start instanceof DateTime) || !(end instanceof DateTime)) {
      const now = DateTime.now();
      return [now.minus({ weeks: 4 }).startOf("day").toMillis(), now.endOf("day").toMillis()] as [
        number,
        number,
      ];
    }

    if (!start.isValid || !end.isValid) {
      const now = DateTime.now();
      return [now.minus({ weeks: 4 }).startOf("day").toMillis(), now.endOf("day").toMillis()] as [
        number,
        number,
      ];
    }

    return [start.toMillis(), end.toMillis()] as [number, number];
  },
  set: (value: [number, number] | null) => {
    if (value) {
      const [start, end] = value;
      pilotDataStore.startDate = DateTime.fromMillis(start).startOf("day");
      pilotDataStore.endDate = DateTime.fromMillis(end).endOf("day");
    }
  },
});

// Define shortcuts for quick date selections
const shortcuts = {
  "Last 4 Weeks": () => {
    const now = Date.now();
    const fourWeeksAgo = now - 28 * 24 * 60 * 60 * 1000;
    return [fourWeeksAgo, now];
  },
  "Current Month": () => {
    const now = DateTime.now();
    return [now.startOf("month").toMillis(), now.endOf("day").toMillis()];
  },
  "Past Month": () => {
    const lastMonth = DateTime.now().minus({ months: 1 });
    return [lastMonth.startOf("month").toMillis(), lastMonth.endOf("month").toMillis()];
  },
  "Current Week": () => {
    const now = DateTime.now();
    return [now.startOf("week").toMillis(), now.endOf("day").toMillis()];
  },
  "Past Week": () => {
    const lastWeek = DateTime.now().minus({ weeks: 1 });
    return [lastWeek.startOf("week").toMillis(), lastWeek.endOf("week").toMillis()];
  },
};

const handleDateRangeChange = (value: [number, number] | null) => {
  if (value && !isNull(rootStore.squadron)) {
    const [start, end] = value;
    pilotDataStore.loadPilotData({
      squadron: rootStore.squadron.username,
      pilot: props.pilot,
      dateRange: {
        start: DateTime.fromMillis(start).startOf("day"),
        end: DateTime.fromMillis(end).endOf("day"),
      },
    });
  }
};
</script>
