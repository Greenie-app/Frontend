<template>
  <n-form @submit.prevent="onSubmit" ref="formRef">
    <n-space vertical>
      <n-form-item
        :validation-status="hasError ? 'error' : undefined"
        :feedback="fieldErrors.join(', ')"
        :show-feedback="hasError"
      >
        <n-upload
          v-model:file-list="files"
          multiple
          directory-dnd
          :show-file-list="true"
          :input-props="{ id: 'logfile-files' }"
        >
          <n-upload-dragger>
            <n-space vertical align="center">
              <n-icon size="48" :depth="3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" fill="currentColor" />
                </svg>
              </n-icon>
              <n-text :depth="1">
                {{ $t("uploadModal.placeholder") }}
              </n-text>
            </n-space>
          </n-upload-dragger>
        </n-upload>
      </n-form-item>

      <n-space>
        <n-button :disabled="busy" attr-type="submit" type="primary" data-cy="uploadSubmit">
          <n-spin v-if="busy" size="small" />
          <template v-else>
            {{ $t("uploadModal.uploadButton") }}
          </template>
        </n-button>
      </n-space>

      <n-alert v-if="formError" type="error">
        {{ formError }}
      </n-alert>
    </n-space>
  </n-form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  NForm,
  NFormItem,
  NSpace,
  NButton,
  NSpin,
  NAlert,
  NUpload,
  NUploadDragger,
  NIcon,
  NText,
  type FormInst,
  type UploadFileInfo,
} from "naive-ui";
import { isString, isNull, has } from "lodash-es";
import { useFormErrors } from "@/composables/useFormErrors";
import { useLogfilesStore } from "@/stores/logfiles";

const logfilesStore = useLogfilesStore();
const { formError, formErrors, resetErrors } = useFormErrors();

const formRef = ref<FormInst>();
const files = ref<UploadFileInfo[]>([]);
const busy = ref(false);

const hasError = computed(() => !isNull(formErrors.value) && has(formErrors.value, "files"));
const fieldErrors = computed((): string[] => {
  if (!hasError.value) return [];
  return formErrors.value!["files"] || [];
});

async function onSubmit(): Promise<void> {
  if (!formRef.value) return;

  resetErrors();
  busy.value = true;

  try {
    const formData = new FormData();

    if (!files.value || files.value.length === 0) {
      formError.value = "Please select at least one file";
      return;
    }

    // Append all files from the n-upload component
    files.value.forEach((fileInfo) => {
      if (fileInfo.file) {
        formData.append("logfile[files][]", fileInfo.file);
      }
    });

    const result = await logfilesStore.uploadLogfiles({ body: formData });
    if (!result.ok) {
      formErrors.value = result.val;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      formError.value = error.message;
    } else if (isString(error)) {
      formError.value = error;
    } else {
      throw error;
    }
  } finally {
    busy.value = false;
  }
}
</script>
