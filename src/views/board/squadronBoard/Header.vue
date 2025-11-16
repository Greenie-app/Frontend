<template>
  <n-space align="center">
    <img
      v-if="squadron.image"
      :src="squadron.image.url"
      id="squadron-header-image"
      alt="Squadron image"
    />
    <h1 data-cy="squadronBoardTitle" class="squadron-title">
      {{ $t("squadronBoard.title", [squadron.name]) }}
    </h1>
  </n-space>
</template>

<script setup lang="ts">
import { NSpace } from "naive-ui";
import type { Squadron } from "@/types";

interface Props {
  squadron: Squadron;
}

defineProps<Props>();
</script>

<style scoped>
#squadron-header-image {
  max-height: 57px;
}

.squadron-title {
  flex-grow: 1;
}
</style>
