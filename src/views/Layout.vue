<template>
  <div class="d-flex flex-column h-100">
    <header>
      <navbar />
    </header>
    <main class="flex-shrink-0 py-5" role="main">
      <b-container>
        <router-view />
      </b-container>
    </main>
    <footer-view />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Action, Getter } from 'vuex-class'
  import { Watch } from 'vue-property-decorator'
  import Footer from '@/components/Footer.vue'
  import Navbar from '@/components/Navbar.vue'
  import { Squadron } from '@/types'

  @Component({
    components: { Navbar, FooterView: Footer }
  })
  export default class Layout extends Vue {
    @Getter mySquadron!: Squadron | null

    @Action loadMySquadron!: () => Promise<void>

    @Getter currentUsername!: string | null

    mounted(): void {
      this.onSessionUsernameChanged()
    }

    @Watch('currentUsername')
    onSessionUsernameChanged(): void {
      if (this.mySquadron?.username !== this.currentUsername) this.loadMySquadron()
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    padding-top: 60px;
  }
</style>
