<template>
  <n-form @submit.prevent="onSubmit">
    <n-space vertical>
      <field-with-errors
        :errors="formErrors"
        autocomplete="current-password"
        field="current_password"
        label="changePassword.currentPasswordPlaceholder"
        object="squadron"
        required
        sr-only
        type="password"
        v-model="currentPassword"
      />

      <field-with-errors
        :errors="formErrors"
        autocomplete="new-password"
        field="new_password"
        label="changePassword.newPasswordPlaceholder"
        object="squadron"
        required
        sr-only
        type="password"
        v-model="newPassword"
      />

      <field-with-errors
        :errors="formErrors"
        autocomplete="new-password"
        field="password_confirmation"
        label="changePassword.confirmationPlaceholder"
        object="squadron"
        required
        sr-only
        type="password"
        v-model="passwordConfirmation"
      />

      <n-alert v-if="formError" type="error">
        {{ formError }}
      </n-alert>

      <n-button
        data-cy="changePasswordSubmit"
        attr-type="submit"
        type="primary"
        style="margin-top: 0.5rem"
      >
        {{ $t("changePassword.button") }}
      </n-button>

      <n-alert v-if="success" type="success" data-cy="changePasswordSuccess">
        {{ $t("changePassword.success") }}
      </n-alert>
    </n-space>
  </n-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NForm, NButton, NAlert, NSpace } from "naive-ui";
import { isString } from "lodash-es";
import { useAccountStore } from "@/stores/account";
import { useFormErrors } from "@/composables/useFormErrors";
import FieldWithErrors from "@/components/FieldWithErrors.vue";

const accountStore = useAccountStore();
const { formErrors, formError, resetErrors } = useFormErrors();

const currentPassword = ref("");
const newPassword = ref("");
const passwordConfirmation = ref("");
const success = ref(false);

async function onSubmit(): Promise<void> {
  success.value = false;
  resetErrors();

  try {
    const result = await accountStore.changePassword({
      oldPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmation: passwordConfirmation.value,
    });
    if (result.ok) {
      currentPassword.value = "";
      newPassword.value = "";
      passwordConfirmation.value = "";
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

// Expose for testing
defineExpose({
  onSubmit,
});
</script>
