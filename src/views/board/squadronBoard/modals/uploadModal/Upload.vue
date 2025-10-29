<template>
  <n-flex align="center" data-cy="upload" :size="8">
    <div>
      <img
        class="document-icon"
        src="./../../../../../assets/images/document.svg"
        alt="Document icon"
      />
    </div>
    <div class="upload-text">
      <n-text class="upload-title">
        {{
          $t("uploadModal.logfile.title", {
            date: formatDate(logfile.createdAt),
            size: formatSize(logfile.files[0].byteSize),
          })
        }}
      </n-text>
      <n-flex align="center" data-cy="uploadStatus">
        <n-spin v-if="isLoading" size="small" />
        <n-text :depth="3" :type="isFailed ? 'error' : undefined">
          {{ $t(`uploadModal.logfile.state.${logfile.state}`) }}
        </n-text>
      </n-flex>
    </div>
  </n-flex>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NFlex, NSpin, NText } from "naive-ui";
import { DateTime } from "luxon";
import numeral from "numeral";
import { Logfile, LogfileState } from "@/types";

interface Props {
  logfile: Logfile;
}

const props = defineProps<Props>();

const isLoading = computed(() => props.logfile.state === LogfileState.InProgress);
const isFailed = computed(() => props.logfile.state === LogfileState.Failed);

function formatDate(date: DateTime): string {
  return date.toLocaleString(DateTime.DATETIME_MED);
}

function formatSize(bytes: number): string {
  return numeral(bytes).format("0,0 b");
}
</script>

<style scoped>
.document-icon {
  width: 32px;
}

.upload-text {
  flex: 1;
}

.upload-title {
  display: block;
  margin-bottom: 0.125rem;
}
</style>
