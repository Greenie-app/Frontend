<template>
  <header class="navbar">
    <n-space justify="space-between" align="center">
      <div v-if="mySquadron" class="navbar-brand" @click.prevent="goToSquadronBoard">
        <n-space align="center" :size="8">
          <img
            v-if="mySquadron.image"
            :src="mySquadron.image.url"
            class="squadron-insignia"
            alt="Squadron insignia"
          />
          <h2 class="squadron-name">{{ mySquadron.name }}</h2>
        </n-space>
      </div>
      <h2 v-else class="navbar-brand" @click.prevent="goHome">Greenie.app</h2>
      <n-menu
        mode="horizontal"
        :options="menuOptions"
        :value="null"
        @update:value="handleMenuSelect"
      />
    </n-space>
  </header>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NSpace, NMenu, type MenuOption } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useMySquadronStore } from '@/stores/mySquadron'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const mySquadronStore = useMySquadronStore()

const mySquadron = computed(() => mySquadronStore.mySquadron)
const loggedIn = computed(() => authStore.loggedIn)

const menuOptions = computed((): MenuOption[] => {
  const options: MenuOption[] = []

  if (!loggedIn.value) {
    options.push({
      label: () => h('span', { 'data-cy': 'logInLink' }, t('navbar.logIn')),
      key: 'login',
    })
  } else {
    options.push({
      label: () => h('span', { 'data-cy': 'editSquadronLink' }, t('navbar.editSquadron')),
      key: 'editSquadron',
    })
    options.push({
      label: () => h('span', { 'data-cy': 'changePasswordLink' }, t('navbar.changePassword')),
      key: 'changePassword',
    })
    options.push({
      label: () => h('span', { 'data-cy': 'logOutLink' }, t('navbar.logOut')),
      key: 'logout',
    })
  }

  return options
})

function goHome(): void {
  if (route.name !== 'Home') {
    router.push({ name: 'Home' })
  }
}

function goToSquadronBoard(): void {
  if (mySquadron.value?.username) {
    router.push({
      name: 'SquadronBoard',
      params: { squadron: mySquadron.value.username },
    })
  }
}

async function logOutClicked(): Promise<void> {
  await authStore.logOut()
  goHome()
}

function handleMenuSelect(key: string): void {
  switch (key) {
    case 'login':
      router.push({ name: 'LogIn' })
      break
    case 'editSquadron':
      router.push({ name: 'EditSquadron', query: route.query })
      break
    case 'changePassword':
      router.push({ name: 'ChangePassword', query: route.query })
      break
    case 'logout':
      logOutClicked()
      break
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0.5rem 1rem;
  background-color: var(--n-color);
  border-bottom: 1px solid var(--n-border-color);
}

.navbar-brand {
  cursor: pointer;
  margin: 0;
}

.squadron-name {
  margin: 0;
}

.squadron-insignia {
  height: 32px;
  width: auto;
}
</style>
