<template>
  <error v-if="passesStore.passesError" :error="passesStore.passesError.message" />

  <n-space vertical v-else-if="passesStore.passesLoaded">
    <board-header :squadron="rootStore.squadron!" />

    <p v-if="passesStore.noPasses">
      {{ $t("squadronBoard.noPasses") }}
    </p>
    <passes-table v-else />

    <n-space justify="space-between" style="margin-top: 1.5rem">
      <actions v-if="isMySquadron" />
      <pagination />
    </n-space>
  </n-space>

  <spinner v-else />
</template>

<script setup lang="ts">
import { NSpace } from "naive-ui";
import { useRootStore } from "@/stores/root";
import { usePassesStore } from "@/stores/passes";
import { useAuthCheck } from "@/composables/useAuthCheck";
import Error from "@/components/Error.vue";
import Spinner from "@/components/Spinner.vue";
import PassesTable from "@/views/board/squadronBoard/Table.vue";
import BoardHeader from "@/views/board/squadronBoard/Header.vue";
import Actions from "@/views/board/squadronBoard/Actions.vue";
import Pagination from "@/views/board/squadronBoard/Pagination.vue";

const rootStore = useRootStore();
const passesStore = usePassesStore();
const { isMySquadron } = useAuthCheck();
</script>
