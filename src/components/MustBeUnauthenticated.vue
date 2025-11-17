<template>
  <div>
    <n-alert v-if="authStore.loggedIn" type="info">
      {{ $t('mustBeLoggedOut') }}
    </n-alert>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NAlert } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

/** Wrap your view in this component to require that the user be logged out. */

const router = useRouter()
const authStore = useAuthStore()

function handleLoggedIn(): void {
  if (authStore.loggedIn && authStore.currentUsername) {
    router.push({
      name: 'SquadronBoard',
      params: { squadron: authStore.currentUsername },
    })
  }
}

watch(() => authStore.loggedIn, handleLoggedIn)

onMounted(handleLoggedIn)
</script>
