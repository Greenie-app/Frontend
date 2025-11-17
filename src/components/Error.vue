<template>
  <n-alert type="error" :title="$t('error.title')">
    {{ error }}
  </n-alert>
</template>

<script setup lang="ts">
import { NAlert } from 'naive-ui'

interface Props {
  error: string
}

defineProps<Props>()
</script>
