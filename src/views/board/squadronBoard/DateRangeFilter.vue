<template>
  <n-space align="center" :wrap-item="false">
    <n-date-picker
      v-model:value="dateRange"
      type="daterange"
      :shortcuts="shortcuts"
      :disabled="passesStore.passesLoading"
      @update:value="handleDateRangeChange"
    />
    <slot name="actions" />
  </n-space>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { NDatePicker, NSpace } from "naive-ui";
import { DateTime } from "luxon";
import { usePassesStore } from "@/stores/passes";
import { useRootStore } from "@/stores/root";
import { isNull } from "lodash-es";

const passesStore = usePassesStore();
const rootStore = useRootStore();

// Convert DateTime to timestamp for Naive UI
const dateRange = computed({
  get: () => {
    // Check if dates exist and are DateTime instances
    const start = passesStore.startDate;
    const end = passesStore.endDate;

    if (!start || !end) {
      const now = DateTime.now();
      return [now.minus({ weeks: 4 }).startOf("day").toMillis(), now.endOf("day").toMillis()] as [
        number,
        number,
      ];
    }

    // Check if they are actually DateTime instances
    if (!(start instanceof DateTime) || !(end instanceof DateTime)) {
      const now = DateTime.now();
      return [now.minus({ weeks: 4 }).startOf("day").toMillis(), now.endOf("day").toMillis()] as [
        number,
        number,
      ];
    }

    // Check if they are valid
    if (!start.isValid || !end.isValid) {
      const now = DateTime.now();
      return [now.minus({ weeks: 4 }).startOf("day").toMillis(), now.endOf("day").toMillis()] as [
        number,
        number,
      ];
    }

    const range = [start.toMillis(), end.toMillis()] as [number, number];

    return range;
  },
  set: (value: [number, number] | null) => {
    if (value) {
      const [start, end] = value;
      passesStore.startDate = DateTime.fromMillis(start).startOf("day");
      passesStore.endDate = DateTime.fromMillis(end).endOf("day");
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
    passesStore.loadPasses({
      squadron: rootStore.squadron.username,
      dateRange: {
        start: DateTime.fromMillis(start).startOf("day"),
        end: DateTime.fromMillis(end).endOf("day"),
      },
    });
  }
};

// On component mount, reload passes with date filter if we have a squadron
// Don't do this in Cypress tests as the test data is from 2020
onMounted(() => {
  // Skip auto-load in Cypress environment to allow tests to control data loading
  if ((window as any).Cypress) {
    return;
  }

  if (rootStore.squadron) {
    passesStore.loadPasses({
      squadron: rootStore.squadron.username,
      dateRange: {
        start: passesStore.startDate,
        end: passesStore.endDate,
      },
    });
  }
});

// Watch for squadron changes to reload with current date range
watch(
  () => rootStore.squadron,
  (squadron, oldSquadron) => {
    // Skip auto-load in Cypress environment to allow tests to control data loading
    if ((window as any).Cypress) {
      return;
    }

    if (squadron && squadron !== oldSquadron) {
      passesStore.loadPasses({
        squadron: squadron.username,
        dateRange: {
          start: passesStore.startDate,
          end: passesStore.endDate,
        },
      });
    }
  },
);
</script>
