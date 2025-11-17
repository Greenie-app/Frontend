<template>
  <narrow v-if="authStore.loggedIn && mySquadronStore.mySquadron">
    <n-space vertical>
      <h3>{{ $t('editSquadron.header') }}</h3>
      <edit-form />
    </n-space>
  </narrow>
  <spinner v-else-if="authStore.loggedIn" />
  <n-alert v-else type="warning">
    {{ $t('mustBeLoggedIn') }}
  </n-alert>
</template>

<script setup lang="ts">
import { NSpace, NAlert } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useMySquadronStore } from '@/stores/mySquadron'
import Narrow from '@/components/Narrow.vue'
import Spinner from '@/components/Spinner.vue'
import EditForm from '@/views/squadron/editSquadron/Form.vue'

const authStore = useAuthStore()
const mySquadronStore = useMySquadronStore()
</script>
