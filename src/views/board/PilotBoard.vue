<template>
  <div>
    <pilot-header :pilot="pilot" :squadron="rootStore.squadron!" />
    <pilot-table :pilot="pilot" :squadron="rootStore.squadron!" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/root";
import PilotTable from "@/views/board/pilotBoard/Table.vue";
import PilotHeader from "@/views/board/pilotBoard/Header.vue";

const route = useRoute();
const rootStore = useRootStore();

const pilot = computed(() => route.params.pilot as string);
</script>
