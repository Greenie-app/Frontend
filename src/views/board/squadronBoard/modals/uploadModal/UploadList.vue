<template>
  <div id="upload-list">
    <n-alert v-if="logfilesStore.logfilesError" type="error">
      {{ logfilesStore.logfilesError.message }}
    </n-alert>
    <n-space v-else-if="logfilesStore.logfilesLoading" justify="center" :size="16">
      <n-spin />
    </n-space>
    <template v-else>
      <upload v-for="logfile in logfilesStore.logfiles" :key="logfile.ID" :logfile="logfile" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { NAlert, NSpin, NSpace } from 'naive-ui'
import { isNull } from 'lodash-es'
import { useMySquadronStore } from '@/stores/mySquadron'
import { useLogfilesStore } from '@/stores/logfiles'
import Upload from '@/views/board/squadronBoard/modals/uploadModal/Upload.vue'

const mySquadronStore = useMySquadronStore()
const logfilesStore = useLogfilesStore()

function onSquadronChanged(): void {
  if (isNull(mySquadronStore.mySquadron)) {
    logfilesStore.resetLogfiles()
  } else {
    logfilesStore.loadLogfiles()
  }
}

watch(() => mySquadronStore.mySquadron, onSquadronChanged)

onMounted(() => {
  onSquadronChanged()
})
</script>

<style scoped>
#upload-list {
  max-height: 50vh;
  overflow-y: scroll;
}
</style>
