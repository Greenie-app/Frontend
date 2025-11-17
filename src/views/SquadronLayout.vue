<template>
  <squadron-must-be-loaded>
    <router-view />
  </squadron-must-be-loaded>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { get, isNull } from 'lodash-es'
import { useRootStore } from '@/stores/root'
import { usePassesStore } from '@/stores/passes'
import SquadronMustBeLoaded from '@/components/SquadronMustBeLoaded.vue'

const route = useRoute()
const rootStore = useRootStore()
const passesStore = usePassesStore()

const routeUsername = computed(() => get(route, ['params', 'squadron'], null) as string | null)

async function handleRouteUsernameChanged(): Promise<void> {
  if (rootStore.squadron?.username !== routeUsername.value) {
    await rootStore.loadSquadron({ username: routeUsername.value })
    if (!isNull(rootStore.squadron)) {
      await passesStore.loadPasses({ squadron: rootStore.squadron.username })
    }
  }
}

watch(routeUsername, handleRouteUsernameChanged)

onMounted(handleRouteUsernameChanged)
</script>
