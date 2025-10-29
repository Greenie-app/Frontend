<template>
  <n-flex
    vertical
    justify="center"
    class="pass-cell"
    :class="[
      aircraftTypeClass,
      cellVariant,
      { unscored: isUnscored, 'cursor-pointer': isMySquadron },
    ]"
    @click="onClick"
    data-cy="passCell"
  >
    <n-text :depth="3" tag="p" class="date">{{ formatDate(pass.time) }}</n-text>
    <n-text tag="p" class="score-info">
      <n-text strong tag="strong" data-cy="passCellScore">{{
        scoreFilter(pass.score ?? 0)
      }}</n-text>
      <n-text :depth="3" tag="small" class="grade" data-cy="passCellGrade" v-if="pass.grade">
        <span :class="{ underline: isPerfect }">{{ grade }}</span
        >{{ wireIfAny }}
      </n-text>
    </n-text>

    <edit-pass-modal v-if="isMySquadron" v-model:show="showEditModal" :pass="pass" />
  </n-flex>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { isNull } from "lodash-es";
import { DateTime } from "luxon";
import { NText, NFlex } from "naive-ui";
import { Grade, Pass } from "@/types";
import EditPassModal from "@/views/board/squadronBoard/modals/EditPassModal.vue";
import { variant } from "@/config/utils";
import { scoreFilter } from "@/config/filters";
import { useAuthCheck } from "@/composables/useAuthCheck";

interface Props {
  pass: Pass;
}

const props = defineProps<Props>();
const { t } = useI18n();
const { isMySquadron } = useAuthCheck();

const showEditModal = ref(false);

const cellVariant = computed(() => variant(props.pass));
const isUnscored = computed(() => isNull(cellVariant.value));

const aircraftTypeClass = computed(() => {
  const type = props.pass.aircraftType;
  if (!type) return null;

  // All F-14 variants
  if (type.startsWith("F-14")) return "f14";

  // All F/A-18 variants
  if (type.startsWith("FA-18")) return "f18";

  // Su-33 uses same silhouette as F-14 (single-seat carrier fighter)
  if (type === "Su-33") return "f14";

  // Support aircraft don't have silhouettes
  return null;
});

const grade = computed(() => {
  if (isNull(props.pass.grade)) return "";

  const translated = t(`pass.grade.${props.pass.grade}`);
  const matches = translated.match(/^_(.+)_$/);
  if (matches) return matches[1];
  return translated;
});

const isPerfect = computed(() => !isNull(props.pass.grade) && props.pass.grade === Grade.Perfect);

const wireIfAny = computed(() => (isNull(props.pass.wire) ? "" : `-${props.pass.wire}`));

function formatDate(date: DateTime): string {
  return date.toLocaleString({ month: "2-digit", day: "2-digit" });
}

function onClick(): void {
  if (isMySquadron) {
    showEditModal.value = true;
  }
}
</script>

<style scoped>
.pass-cell {
  position: relative;
  width: 100px;
  height: 100px;
  padding: 0.5rem;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  box-sizing: border-box;
}

.pass-cell::before {
  content: "";
  position: absolute;
  inset: 0;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 60%;
  opacity: 0.25;
  pointer-events: none;
}

.f18::before {
  background-image: url("../../../../assets/images/f18.png");
}

.f14::before {
  background-image: url("../../../../assets/images/f14.png");
}

.date {
  text-align: center;
  margin: 0;
  position: relative;
  z-index: 1;
}

.score-info {
  text-align: center;
  margin: 0;
  position: relative;
  z-index: 1;
}

.grade {
  margin-left: 0.5rem;
}

.cursor-pointer {
  cursor: pointer;
}

.unscored {
  background-color: #e9ecef;
}

.underline {
  text-decoration: underline;
}

.success {
  background-color: #d4edda;
}

.warning {
  background-color: #ffc107;
}

.danger {
  background-color: #f8d7da;
}
</style>
