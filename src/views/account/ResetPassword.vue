<template>
  <must-be-unauthenticated>
    <narrow>
      <n-space vertical>
        <h3>{{ $t('resetPassword.title') }}</h3>
        <n-form @submit.prevent="onSubmit">
          <n-space vertical>
            <field-with-errors
              :errors="formErrors"
              autocomplete="new-password"
              field="password"
              label="changePassword.newPasswordPlaceholder"
              object="squadron"
              required
              sr-only
              type="password"
              v-model="password"
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

            <n-alert v-if="formError" type="error" data-cy="resetPasswordError">
              {{ formError }}
            </n-alert>

            <n-button data-cy="resetPasswordSubmit" attr-type="submit" type="primary">
              {{ $t('changePassword.button') }}
            </n-button>
          </n-space>
        </n-form>
      </n-space>
    </narrow>
  </must-be-unauthenticated>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NForm, NButton, NAlert, NSpace, useDialog } from 'naive-ui'
import { has, isString } from 'lodash-es'
import { useI18n } from 'vue-i18n'
import MustBeUnauthenticated from '@/components/MustBeUnauthenticated.vue'
import Narrow from '@/components/Narrow.vue'
import { useAccountStore } from '@/stores/account'
import { useFormErrors } from '@/composables/useFormErrors'
import FieldWithErrors from '@/components/FieldWithErrors.vue'

const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const { t } = useI18n()
const accountStore = useAccountStore()
const { formErrors, formError, resetErrors } = useFormErrors()

const password = ref('')
const passwordConfirmation = ref('')

const token = computed(() => route.params.token as string)

async function onSubmit(): Promise<void> {
  resetErrors()

  try {
    const result = await accountStore.resetPassword({
      password: password.value,
      confirmation: passwordConfirmation.value,
      token: token.value,
    })
    if (result.ok) {
      dialog.success({
        title: t('resetPassword.successMessage') as string,
        positiveText: 'OK',
        onPositiveClick: () => {
          router.push({ name: 'Home' })
        },
      })
    } else if (has(result.val, 'reset_password_token')) {
      dialog.error({
        title: t('resetPassword.badToken') as string,
        positiveText: 'OK',
        onPositiveClick: () => {
          router.push({ name: 'Home' })
        },
      })
    } else {
      formErrors.value = result.val
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      formError.value = error.message
    } else if (isString(error)) {
      formError.value = error
    } else {
      throw error
    }
  }
}

// Expose for testing
defineExpose({
  onSubmit,
})
</script>
