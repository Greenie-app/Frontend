<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-dialog-provider>
      <n-layout class="layout-container">
        <navbar />
        <n-layout-content class="main-content">
          <router-view />
        </n-layout-content>
        <footer-view />
      </n-layout>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { NConfigProvider, NDialogProvider, NLayout, NLayoutContent } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useMySquadronStore } from '@/stores/mySquadron'
import Navbar from '@/components/Navbar.vue'
import FooterView from '@/components/Footer.vue'

const authStore = useAuthStore()
const mySquadronStore = useMySquadronStore()

const themeOverrides = {
  common: {
    primaryColor: '#007bff',
  },
}

function handleUsernameChanged(): void {
  if (mySquadronStore.mySquadron?.username !== authStore.currentUsername) {
    mySquadronStore.loadMySquadron()
  }
}

watch(() => authStore.currentUsername, handleUsernameChanged)

onMounted(handleUsernameChanged)
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 5rem 1rem 2rem;
}
</style>
