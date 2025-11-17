<template>
  <n-space vertical>
    <n-breadcrumb data-cy="breadcrumbs">
      <n-breadcrumb-item>
        <router-link
          :to="{
            name: 'SquadronBoard',
            params: { squadron: mySquadronStore.mySquadron?.username },
            query: { from: route.query.from, to: route.query.to },
          }"
        >
          {{ mySquadronStore.mySquadron?.name }}
        </router-link>
      </n-breadcrumb-item>
      <n-breadcrumb-item>{{ pilot }}</n-breadcrumb-item>
    </n-breadcrumb>

    <n-space align="center" justify="space-between">
      <h1 data-cy="pilotBoardTitle" class="pilot-title">{{ pilot }}</h1>

      <n-space v-if="isMySquadron">
        <n-button @click="showRenameModal = true" data-cy="renameButton">
          {{ $t('pilotBoard.actions.rename') }}
        </n-button>

        <n-dropdown :options="mergeOptions" @select="confirmMerge" trigger="click">
          <n-button data-cy="mergeButton">
            {{ $t('pilotBoard.actions.merge') }}
          </n-button>
        </n-dropdown>

        <n-button @click="confirmDelete" data-cy="deletePilotButton" type="error">
          {{ $t('pilotBoard.actions.delete') }}
        </n-button>
      </n-space>
    </n-space>

    <rename-modal v-model:show="showRenameModal" :pilot="pilot" />
    <merge-modal v-model:show="showMergeModal" :predator="mergeTarget" :prey="pilot" />
  </n-space>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDialog, NBreadcrumb, NBreadcrumbItem, NSpace, NButton, NDropdown } from 'naive-ui'
import RenameModal from '@/views/board/pilotBoard/RenameModal.vue'
import MergeModal from '@/views/board/pilotBoard/MergeModal.vue'
import { useAuthCheckRequiredSquadron } from '@/composables/useAuthCheckRequiredSquadron'
import { useMySquadronStore } from '@/stores/mySquadron'
import { usePassesStore } from '@/stores/passes'
import { usePilotsStore } from '@/stores/pilots'

interface Props {
  pilot: string
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const dialog = useDialog()
const mySquadronStore = useMySquadronStore()
const passesStore = usePassesStore()
const pilotsStore = usePilotsStore()
const { isMySquadron } = useAuthCheckRequiredSquadron()

const showRenameModal = ref(false)
const showMergeModal = ref(false)
const mergeTarget = ref<string | null>(null)

const otherPilots = computed(() => passesStore.pilotNames.filter((name) => name !== props.pilot))

const mergeOptions = computed(() =>
  otherPilots.value.map((name: string) => ({
    label: name,
    key: name,
  })),
)

function confirmMerge(pilot: string): void {
  mergeTarget.value = pilot
  showMergeModal.value = true
}

async function confirmDelete(): Promise<void> {
  return new Promise((resolve) => {
    dialog.error({
      title: t('pilotBoard.deleteConfirmModal.title'),
      content: t('pilotBoard.deleteConfirmModal.message', [props.pilot]),
      positiveText: t('pilotBoard.deleteConfirmModal.okButton'),
      negativeText: t('editSquadron.confirmDelete.cancelButton'),
      onPositiveClick: async () => {
        try {
          await pilotsStore.deletePilot({ pilot: props.pilot })
          await passesStore.loadPasses({ squadron: mySquadronStore.mySquadron!.username })
          await router.push({
            name: 'SquadronBoard',
            params: { squadron: mySquadronStore.mySquadron!.username },
            query: { from: route.query.from, to: route.query.to },
          })
          resolve()
        } catch (error: unknown) {
          if (error instanceof Error) {
            dialog.error({
              title: t('errorModal'),
              content: error.message,
              positiveText: t('ok'),
            })
          } else {
            throw error
          }
        }
      },
      onNegativeClick: () => {
        resolve()
      },
    })
  })
}

// Expose for testing
defineExpose({
  confirmDelete,
})
</script>

<style scoped>
.pilot-title {
  margin: 0;
}
</style>
