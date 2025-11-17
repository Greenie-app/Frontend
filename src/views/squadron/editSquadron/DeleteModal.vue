<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    type="error"
    :title="$t('editSquadron.confirmDelete.title')"
    :positive-text="$t('editSquadron.confirmDelete.okButton')"
    :negative-text="$t('editSquadron.confirmDelete.cancelButton')"
    @positive-click="deleteClicked"
  >
    <n-space vertical :size="24">
      <p>
        {{ $t('editSquadron.confirmDelete.text', [mySquadronStore.mySquadron!.name]) }}
      </p>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NModal, NSpace } from 'naive-ui'
import { useMySquadronStore } from '@/stores/mySquadron'
import { useAccountStore } from '@/stores/account'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const mySquadronStore = useMySquadronStore()
const accountStore = useAccountStore()
const authStore = useAuthStore()

const showModal = defineModel<boolean>('show', { default: false })

async function deleteClicked(): Promise<void> {
  await accountStore.deleteAccount()
  await authStore.logOut()
  await router.push({ name: 'Home' })
}
</script>
