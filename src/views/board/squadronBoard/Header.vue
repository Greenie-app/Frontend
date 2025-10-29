<template>
  <n-space vertical>
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
    <p v-if="hasBoardingRate" data-cy="squadronBoardingRate">
      {{ $t("squadronBoard.boardingRate", [boardingRate]) }}
    </p>
  </n-space>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NSpace } from "naive-ui";
import { isNull } from "lodash-es";
import numeral from "numeral";
import type { Squadron } from "@/types";

interface Props {
  squadron: Squadron;
}

const props = defineProps<Props>();

const boardingRate = computed(() => {
  if (isNull(props.squadron.boardingRate)) return "";
  return numeral(props.squadron.boardingRate).format("0.00");
});

const hasBoardingRate = computed(() => !isNull(props.squadron.boardingRate));
</script>

<style scoped>
#squadron-header-image {
  max-height: 57px;
}

.squadron-title {
  flex-grow: 1;
}
</style>
