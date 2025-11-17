<template>
  <div v-if="hasErrors" class="error-statistics">
    <h3>{{ $t("pilotBoard.errorStatistics.title") }}</h3>

    <!-- Overall Top 3 Errors -->
    <div v-if="hasOverallErrors" class="error-section">
      <h4>{{ $t("pilotBoard.errorStatistics.overall") }}</h4>
      <n-data-table
        :columns="columns"
        :data="errorStatistics.overall"
        :bordered="false"
        size="small"
        data-cy="errorStatisticsOverallTable"
      />
    </div>

    <!-- Errors by Phase -->
    <div
      v-for="(phaseData, phaseCode) in errorStatistics.byPhase"
      :key="phaseCode"
      class="error-section"
    >
      <h4>{{ phaseData.phaseDescription }}</h4>
      <n-data-table
        :columns="columns"
        :data="phaseData.errors"
        :bordered="false"
        size="small"
        :data-cy="`errorStatistics${phaseCode}Table`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { NDataTable } from "naive-ui";
import { isEmpty } from "lodash-es";
import type { DataTableColumns } from "naive-ui";
import type { ErrorStatistic, ErrorStatistics } from "@/types";

interface Props {
  errorStatistics: ErrorStatistics;
}

const props = defineProps<Props>();
const { t } = useI18n();

const hasOverallErrors = computed(() => !isEmpty(props.errorStatistics.overall));
const hasPhaseErrors = computed(() => !isEmpty(props.errorStatistics.byPhase));
const hasErrors = computed(() => hasOverallErrors.value || hasPhaseErrors.value);

const columns = computed<DataTableColumns<ErrorStatistic>>(() => [
  {
    key: "code",
    title: t("pilotBoard.errorStatistics.code"),
    width: 100,
  },
  {
    key: "description",
    title: t("pilotBoard.errorStatistics.description"),
    render: (row) => row.description ?? "",
  },
  {
    key: "count",
    title: t("pilotBoard.errorStatistics.count"),
    width: 80,
  },
  {
    key: "score",
    title: t("pilotBoard.errorStatistics.score"),
    width: 80,
    render: (row) => row.score.toFixed(1),
  },
]);
</script>

<style scoped>
.error-statistics {
  margin-top: 2rem;
}

.error-statistics h3 {
  margin-bottom: 1rem;
}

.error-section {
  margin-bottom: 1.5rem;
}

.error-section h4 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}
</style>
