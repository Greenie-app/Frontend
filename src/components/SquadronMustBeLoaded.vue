<template>
  <div>
    <error v-if="rootStore.squadronError" :error="rootStore.squadronError.message" />
    <slot v-else-if="rootStore.squadronLoaded" />
    <spinner v-else />
  </div>
</template>

<script setup lang="ts">
import { useRootStore } from '@/stores/root'
import Spinner from '@/components/Spinner.vue'
import Error from '@/components/Error.vue'

/**
 * Wrap your view with this component to require that the Squadron has finished loading, or to
 * display a Spinner if the squadron is still loading.
 */

const rootStore = useRootStore()
</script>
