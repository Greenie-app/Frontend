<template>
  <n-form @submit.prevent="onSubmit">
    <n-space vertical>
      <n-form-item>
        <n-input
          v-model:value="username"
          :placeholder="$t('logIn.usernamePlaceholder')"
          autocomplete="username"
          id="login-field"
        />
      </n-form-item>

      <n-form-item>
        <n-input
          v-model:value="password"
          :placeholder="$t('logIn.passwordPlaceholder')"
          autocomplete="current-password"
          id="password-field"
          type="password"
        />
      </n-form-item>

      <n-form-item>
        <n-checkbox v-model:checked="rememberMe" id="remember-me">
          {{ $t('logIn.rememberMe') }}
        </n-checkbox>
      </n-form-item>

      <n-space justify="space-between">
        <n-button data-cy="loginSubmitButton" attr-type="submit" type="primary">
          {{ $t('logIn.logInButton') }}
        </n-button>
        <n-button
          text
          tag="a"
          @click="() => $router.push({ name: 'ForgotPassword' })"
          data-cy="forgotPasswordLink"
        >
          {{ $t('logIn.forgotPassword') }}
        </n-button>
      </n-space>

      <n-alert v-if="loginError" type="error" data-cy="loginError">
        {{ loginError }}
      </n-alert>
    </n-space>
  </n-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NForm, NFormItem, NInput, NCheckbox, NButton, NSpace, NAlert } from 'naive-ui'
import { isString } from 'lodash-es'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loginError = ref<string | null>(null)

const authStore = useAuthStore()

async function onSubmit(): Promise<void> {
  loginError.value = null
  try {
    const result = await authStore.logIn({
      username: username.value,
      password: password.value,
      rememberMe: rememberMe.value,
    })
    if (!result.ok) {
      loginError.value = result.val
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      loginError.value = error.message
    } else if (isString(error)) {
      loginError.value = error
    } else {
      throw error
    }
  }
}
</script>
