<template>
  <must-be-unauthenticated>
    <narrow>
      <n-space vertical>
        <h3>{{ $t("forgotPassword.title") }}</h3>
        <p>{{ $t("forgotPassword.text") }}</p>

        <n-form @submit.prevent="onSubmit">
          <n-space>
            <field-with-errors
              :errors="formErrors"
              field="email"
              label="forgotPassword.placeholder"
              object="squadron"
              required
              sr-only
              v-model="email"
              class="email-field"
            />
            <n-button data-cy="forgotPasswordSubmit" attr-type="submit" type="primary">
              {{ $t("forgotPassword.submitButton") }}
            </n-button>
          </n-space>
        </n-form>

        <n-alert v-if="success" type="success" data-cy="forgotPasswordSuccess">
          {{ $t("forgotPassword.success") }}
        </n-alert>
        <n-alert v-if="formError" type="error" data-cy="forgotPasswordError">
          {{ formError }}
        </n-alert>
      </n-space>
    </narrow>
  </must-be-unauthenticated>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NForm, NButton, NSpace, NAlert } from "naive-ui";
import { isString } from "lodash-es";
import MustBeUnauthenticated from "@/components/MustBeUnauthenticated.vue";
import { useAccountStore } from "@/stores/account";
import { useFormErrors } from "@/composables/useFormErrors";
import Narrow from "@/components/Narrow.vue";
import FieldWithErrors from "@/components/FieldWithErrors.vue";

const accountStore = useAccountStore();
const { formErrors, formError, resetErrors } = useFormErrors();

const email = ref("");
const success = ref(false);

async function onSubmit(): Promise<void> {
  success.value = false;
  resetErrors();

  try {
    const result = await accountStore.forgotPassword({ email: email.value });
    if (result.ok) {
      success.value = true;
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
</script>

<style scoped>
.email-field {
  flex-grow: 1;
}
</style>
