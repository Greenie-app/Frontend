<template>
  <n-space vertical>
    <slot v-if="loggedAndLoaded" />
    <spinner v-else-if="authStore.loggedIn" />
    <n-alert v-else type="warning">
      {{ $t('mustBeLoggedIn') }}
    </n-alert>
  </n-space>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NAlert, NSpace } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useRootStore } from '@/stores/root'
import Spinner from '@/components/Spinner.vue'

/** Wrap your view in this component to require that a squadron be logged in before rendering. */

const authStore = useAuthStore()
const rootStore = useRootStore()

const loggedAndLoaded = computed(() => authStore.loggedIn && rootStore.squadronLoaded)
</script>
