<template>
  <narrow v-if="authStore.loggedIn">
    <n-space vertical>
      <h3>{{ $t('changePassword.header') }}</h3>
      <change-password-form />
    </n-space>
  </narrow>
  <n-alert v-else type="warning">
    {{ $t('mustBeLoggedIn') }}
  </n-alert>
</template>

<script setup lang="ts">
import { NAlert, NSpace } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import ChangePasswordForm from '@/views/account/changePassword/Form.vue'
import Narrow from '@/components/Narrow.vue'

const authStore = useAuthStore()
</script>
