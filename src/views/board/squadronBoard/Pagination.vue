<template>
  <n-pagination
    v-if="showPagination"
    v-model:page="page"
    :page-count="pageCount"
    :page-size="perPage"
  />
  <div v-else />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NPagination } from "naive-ui";
import { isNull } from "lodash-es";
import { useRootStore } from "@/stores/root";
import { usePassesStore } from "@/stores/passes";

const perPage = 10;

const rootStore = useRootStore();
const passesStore = usePassesStore();

const showPagination = computed(() => passesStore.passCount > perPage);
const pageCount = computed(() => Math.ceil(passesStore.passCount / perPage));

const page = computed({
  get: () => passesStore.passCurrentPage,
  set: (newPage: number) => {
    if (!isNull(rootStore.squadron)) {
      passesStore.loadPasses({ squadron: rootStore.squadron.username, page: newPage });
    }
  },
});
</script>
