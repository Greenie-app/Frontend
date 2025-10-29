<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="$t('uploadModal.title')"
    :style="{ maxWidth: '600px' }"
  >
    <upload-form />
    <n-divider />
    <upload-list />
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NDivider } from "naive-ui";
import UploadForm from "@/views/board/squadronBoard/modals/uploadModal/UploadForm.vue";
import UploadList from "@/views/board/squadronBoard/modals/uploadModal/UploadList.vue";

const showModal = defineModel<boolean>("show", { default: false });
</script>
