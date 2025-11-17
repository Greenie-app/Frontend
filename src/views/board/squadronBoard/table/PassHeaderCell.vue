<template>
  <div class="pass-header-cell" data-cy="passHeaderCell">
    <i18n-t v-if="hasAverage" keypath="squadronBoard.pilotAndScore" tag="p" class="pilot-info">
      <template #name>
        <n-text tag="span" strong>
          <router-link :to="pilotBoardRoute" data-cy="pilotBoardLink">
            {{ pilot }}
          </router-link>
        </n-text>
      </template>

      <template #score>
        <n-text tag="span" strong>{{ scoreFilter(average!) }}</n-text>
      </template>
    </i18n-t>

    <n-text tag="p" strong class="pilot-info" v-else-if="!isUnknownPilot">
      <router-link :to="pilotBoardRoute">
        {{ pilot }}
      </router-link>
    </n-text>

    <n-text tag="p" strong v-else>{{ $t("unknownPilot") }}</n-text>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { isNull } from "lodash-es";
import { NText } from "naive-ui";
import { scoreFilter } from "@/config/filters";

interface Props {
  pilot: string | null;
  average: number | null;
}

const props = defineProps<Props>();
const route = useRoute();

const isUnknownPilot = computed(() => isNull(props.pilot));
const hasAverage = computed(() => !isNull(props.average));

// Build route with date range query parameters preserved
const pilotBoardRoute = computed(() => ({
  name: "PilotBoard",
  params: { squadron: route.params.squadron, pilot: props.pilot },
  query: {
    from: route.query.from,
    to: route.query.to,
  },
}));
</script>

<style scoped>
.pass-header-cell {
  position: sticky;
  left: 0;
  background: var(--n-color);
  z-index: 1;
  padding: 0.5rem;
  white-space: nowrap;
  min-width: min-content;
}

.pilot-info {
  margin: 0;
  white-space: nowrap;
}
</style>
