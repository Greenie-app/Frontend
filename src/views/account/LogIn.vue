<template>
  <must-be-unauthenticated>
    <narrow>
      <n-space vertical>
        <h3>{{ $t('logIn.header') }}</h3>
        <log-in-form />
        <p>{{ $t('logIn.help') }}</p>
      </n-space>
    </narrow>
  </must-be-unauthenticated>
</template>

<script setup lang="ts">
import { NSpace } from 'naive-ui'
import LogInForm from '@/views/account/logIn/Form.vue'
import MustBeUnauthenticated from '@/components/MustBeUnauthenticated.vue'
import Narrow from '@/components/Narrow.vue'
</script>
