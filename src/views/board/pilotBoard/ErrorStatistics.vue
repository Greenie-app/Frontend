<template>
  <div v-if="hasErrors" class="error-statistics">
    <h3>{{ $t("pilotBoard.errorStatistics.title") }}</h3>
    <n-data-table
      :columns="columns"
      :data="errorStatistics"
      :bordered="false"
      size="small"
      data-cy="errorStatisticsTable"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { NDataTable } from "naive-ui";
import { isEmpty } from "lodash-es";
import type { DataTableColumns } from "naive-ui";
import type { ErrorStatistic } from "@/types";

interface Props {
  errorStatistics: ErrorStatistic[];
}

const props = defineProps<Props>();
const { t } = useI18n();

const hasErrors = computed(() => !isEmpty(props.errorStatistics));

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
</style>
