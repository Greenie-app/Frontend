<template>
  <error v-if="passesStore.passesError" :error="passesStore.passesError.message" />

  <n-space vertical v-else-if="passesStore.passesLoaded">
    <board-header :squadron="rootStore.squadron!" />

    <date-range-filter>
      <template #actions v-if="isMySquadron">
        <n-button @click="showAddPassModal = true" data-cy="addPassButton">
          <template #icon>
            <n-icon>
              <add-outline />
            </n-icon>
          </template>
          {{ $t("squadronBoard.addPassButton") }}
        </n-button>
        <add-pass-modal v-model:show="showAddPassModal" />

        <n-button @click="showUploadModal = true" data-cy="uploadButton">
          <template #icon>
            <n-icon>
              <cloud-upload-outline />
            </n-icon>
          </template>
          {{ $t("squadronBoard.uploadButton") }}
        </n-button>
        <upload-modal v-model:show="showUploadModal" />
      </template>
    </date-range-filter>

    <p v-if="passesStore.noPasses">
      {{ $t("squadronBoard.noPassesInRange") }}
    </p>
    <passes-table v-else />

    <n-space vertical style="margin-top: 1rem">
      <p v-if="hasBoardingRate" data-cy="squadronBoardingRate">
        {{ $t("squadronBoard.boardingRate", [boardingRate]) }}
      </p>
      <n-button
        v-if="isMySquadron && rootStore.unknownPassCount > 0"
        text
        type="error"
        @click="deleteAll"
        data-cy="deleteAllUnassigned"
        :loading="deleteAllBusy"
      >
        {{ $t("squadronBoard.deleteAll.link") }}
      </n-button>
    </n-space>
  </n-space>

  <spinner v-else />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { NSpace, NButton, NIcon, useDialog } from "naive-ui";
import { AddOutline, CloudUploadOutline } from "@vicons/ionicons5";
import { isNull } from "lodash-es";
import numeral from "numeral";
import { useRootStore } from "@/stores/root";
import { usePassesStore } from "@/stores/passes";
import { useAuthCheck } from "@/composables/useAuthCheck";
import Error from "@/components/Error.vue";
import Spinner from "@/components/Spinner.vue";
import PassesTable from "@/views/board/squadronBoard/Table.vue";
import BoardHeader from "@/views/board/squadronBoard/Header.vue";
import DateRangeFilter from "@/views/board/squadronBoard/DateRangeFilter.vue";
import AddPassModal from "@/views/board/squadronBoard/modals/AddPassModal.vue";
import UploadModal from "@/views/board/squadronBoard/modals/UploadModal.vue";

const { t } = useI18n();
const dialog = useDialog();
const rootStore = useRootStore();
const passesStore = usePassesStore();
const { isMySquadron } = useAuthCheck();

const showAddPassModal = ref(false);
const showUploadModal = ref(false);
const deleteAllBusy = ref(false);

const boardingRate = computed(() => {
  if (isNull(passesStore.boardingRate)) return "";
  return numeral(passesStore.boardingRate).format("0.00");
});

const hasBoardingRate = computed(() => !isNull(passesStore.boardingRate));

async function deleteAll(): Promise<void> {
  return new Promise((resolve) => {
    dialog.warning({
      title: t("squadronBoard.deleteAll.title"),
      content: t("squadronBoard.deleteAll.confirm.message", { count: rootStore.unknownPassCount }),
      positiveText: t("squadronBoard.deleteAll.confirm.okButton"),
      negativeText: t("editSquadron.confirmDelete.cancelButton"),
      onPositiveClick: async () => {
        deleteAllBusy.value = true;
        try {
          await passesStore.deleteAllUnknown();
          resolve();
        } catch {
          dialog.error({
            title: t("squadronBoard.deleteAll.title"),
            content: t("squadronBoard.deleteAll.error.message"),
            positiveText: t("squadronBoard.deleteAll.error.okButton"),
          });
        } finally {
          deleteAllBusy.value = false;
        }
      },
      onNegativeClick: () => {
        resolve();
      },
    });
  });
}
</script>
