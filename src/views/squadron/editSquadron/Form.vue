<template>
  <n-form @submit.prevent="onSubmit" ref="formRef">
    <n-space vertical>
      <field-with-errors
        :errors="formErrors"
        field="name"
        label="home.signUp.fields.name"
        object="squadron"
        placeholder=""
        required
        v-model="squadron.name"
      />

      <n-form-item
        :label="$t('home.signUp.fields.image')"
        :validation-status="imageHasError ? 'error' : undefined"
        :feedback="imageFieldErrors.join(', ')"
        :show-feedback="imageHasError"
      >
        <n-upload
          v-model:file-list="imageFiles"
          :max="1"
          accept="image/*"
          :input-props="{ id: 'squadron-image' }"
        >
          <n-button>Select Image</n-button>
        </n-upload>
      </n-form-item>

      <field-with-errors
        :errors="formErrors"
        field="email"
        label="home.signUp.fields.email"
        object="squadron"
        placeholder=""
        required
        type="email"
        v-model="squadron.email"
      />
    </n-space>

    <n-space vertical style="margin-top: 1rem">
      <n-space justify="space-between">
        <n-button data-cy="editSquadronSubmit" attr-type="submit" type="primary">
          {{ $t("editSquadron.submitButton") }}
        </n-button>
        <n-button text type="error" data-cy="deleteSquadronButton" @click="showDeleteModal = true">
          {{ $t("editSquadron.deleteButton") }}
        </n-button>
      </n-space>

      <n-alert v-if="formError" type="error">
        {{ formError }}
      </n-alert>
    </n-space>

    <delete-modal v-model:show="showDeleteModal" />
  </n-form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  NForm,
  NFormItem,
  NButton,
  NSpace,
  NAlert,
  NUpload,
  type FormInst,
  type UploadFileInfo,
} from "naive-ui";
import { isString, isNull, has } from "lodash-es";
import { useRootStore } from "@/stores/root";
import { useMySquadronStore } from "@/stores/mySquadron";
import type { SquadronJSONUp } from "@/stores/coding";
import { squadronToJSON } from "@/stores/coding";
import { useFormErrors } from "@/composables/useFormErrors";
import FieldWithErrors from "@/components/FieldWithErrors.vue";
import DeleteModal from "@/views/squadron/editSquadron/DeleteModal.vue";

const router = useRouter();
const route = useRoute();
const rootStore = useRootStore();
const mySquadronStore = useMySquadronStore();
const { formErrors, formError, resetErrors } = useFormErrors();

const formRef = ref<FormInst>();
const squadron = ref<Partial<SquadronJSONUp>>({});
const imageFiles = ref<UploadFileInfo[]>([]);
const showDeleteModal = ref(false);

const imageHasError = computed(() => !isNull(formErrors.value) && has(formErrors.value, "image"));
const imageFieldErrors = computed((): string[] => {
  if (!imageHasError.value) return [];
  return formErrors.value!["image"] || [];
});

async function onSubmit(): Promise<void> {
  resetErrors();

  try {
    const formData = new FormData();
    if (squadron.value.name) formData.append("squadron[name]", squadron.value.name);
    if (squadron.value.email) formData.append("squadron[email]", squadron.value.email);

    // Get the uploaded file from imageFiles
    const uploadedFile = imageFiles.value[0]?.file;
    if (uploadedFile) {
      formData.append("squadron[image]", uploadedFile);
    }

    const result = await mySquadronStore.updateMySquadron({ body: formData });
    if (result.ok) {
      await router.push({
        name: "SquadronBoard",
        params: { squadron: result.val.username },
        query: route.query,
      });
      await rootStore.loadSquadron({ username: result.val.username });
    } else {
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
  }
}

function updateSquadronData(): void {
  if (mySquadronStore.mySquadron) {
    const data = squadronToJSON(mySquadronStore.mySquadron);
    squadron.value = JSON.parse(JSON.stringify(data));
  }
}

watch(() => mySquadronStore.mySquadron, updateSquadronData);

onMounted(updateSquadronData);
</script>
