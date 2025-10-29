<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="$t('pilotBoard.renameModal.title')"
    style="max-width: 600px"
  >
    <n-form @submit.prevent="onSubmit">
      <n-space vertical>
        <field-with-errors
          :errors="formErrors"
          :interpolations="{ oldName: pilot }"
          field="name"
          label="pilotBoard.renameModal.message"
          object="pilot"
          placeholder=""
          required
          v-model="newName"
        />

        <n-space>
          <n-button data-cy="renameSubmit" :disabled="busy" attr-type="submit" type="primary">
            <n-spin v-if="busy" size="small" />
            <template v-else>
              {{ $t("pilotBoard.renameModal.submit") }}
            </template>
          </n-button>
        </n-space>

        <n-alert v-if="formError" type="error">
          {{ formError }}
        </n-alert>
      </n-space>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NModal, NForm, NSpace, NButton, NSpin, NAlert } from "naive-ui";
import { isString } from "lodash-es";
import FieldWithErrors from "@/components/FieldWithErrors.vue";
import { useFormErrors } from "@/composables/useFormErrors";
import { usePilotsStore } from "@/stores/pilots";

interface Props {
  pilot: string;
}

const props = defineProps<Props>();
const showModal = defineModel<boolean>("show", { default: false });

const router = useRouter();
const route = useRoute();
const pilotsStore = usePilotsStore();
const { formError, formErrors, resetErrors } = useFormErrors();

const newName = ref("");
const busy = ref(false);

async function onSubmit(): Promise<void> {
  resetErrors();
  busy.value = true;

  try {
    const result = await pilotsStore.renamePilot({ oldName: props.pilot, newName: newName.value });
    if (result.ok) {
      await router.push({
        name: "PilotBoard",
        params: { squadron: route.params.squadron, pilot: newName.value },
      });
      showModal.value = false;
      newName.value = "";
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
  } finally {
    busy.value = false;
  }
}
</script>
