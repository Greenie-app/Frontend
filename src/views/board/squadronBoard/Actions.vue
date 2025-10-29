<template>
  <n-space align="center">
    <n-button @click="showAddPassModal = true" data-cy="addPassButton">
      {{ $t("squadronBoard.addPassButton") }}
    </n-button>
    <add-pass-modal v-model:show="showAddPassModal" />

    <n-button @click="showUploadModal = true" data-cy="uploadButton">
      {{ $t("squadronBoard.uploadButton") }}
    </n-button>
    <upload-modal v-model:show="showUploadModal" />

    <n-button
      v-if="rootStore.unknownPassCount > 0"
      text
      type="error"
      @click="deleteAll"
      data-cy="deleteAllUnassigned"
      :loading="busy"
    >
      {{ $t("squadronBoard.deleteAll.link") }}
    </n-button>
  </n-space>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { NSpace, NButton, useDialog } from "naive-ui";
import { useRootStore } from "@/stores/root";
import { usePassesStore } from "@/stores/passes";
import UploadModal from "@/views/board/squadronBoard/modals/UploadModal.vue";
import AddPassModal from "@/views/board/squadronBoard/modals/AddPassModal.vue";

const { t } = useI18n();
const dialog = useDialog();
const rootStore = useRootStore();
const passesStore = usePassesStore();

const showAddPassModal = ref(false);
const showUploadModal = ref(false);
const busy = ref(false);

async function deleteAll(): Promise<void> {
  return new Promise((resolve) => {
    dialog.warning({
      title: t("squadronBoard.deleteAll.title"),
      content: t("squadronBoard.deleteAll.confirm.message", { count: rootStore.unknownPassCount }),
      positiveText: t("squadronBoard.deleteAll.confirm.okButton"),
      negativeText: t("editSquadron.confirmDelete.cancelButton"),
      onPositiveClick: async () => {
        busy.value = true;
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
          busy.value = false;
        }
      },
      onNegativeClick: () => {
        resolve();
      },
    });
  });
}
</script>
