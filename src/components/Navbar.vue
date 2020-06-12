<template>
  <b-navbar class="py-2" fixed="top" toggleable="lg" type="dark" variant="dark">
    <b-navbar-brand @click.prevent="goHome">Greenie.app</b-navbar-brand>
    <b-navbar-toggle target="nav-collapse" />

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item :to="{name: 'LogIn'}" data-cy="logInLink" v-if="!loggedIn">
          {{$t('navbar.logIn')}}
        </b-nav-item>
        <b-nav-item :to="{name: 'EditSquadron'}" data-cy="editSquadronLink" v-if="loggedIn">
          {{$t('navbar.editSquadron')}}
        </b-nav-item>
        <b-nav-item :to="{name: 'ChangePassword'}" data-cy="changePasswordLink" v-if="loggedIn">
          {{$t('navbar.changePassword')}}
        </b-nav-item>
        <b-nav-item @click.prevent="logOutClicked" v-if="loggedIn" data-cy="logOutLink">
          {{$t('navbar.logOut')}}
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Action, Getter } from 'vuex-class'
  import Footer from '@/components/Footer.vue'

  @Component({
    components: { FooterView: Footer }
  })
  export default class Navbar extends Vue {
    @Getter loggedIn!: boolean

    @Action logOut!: () => Promise<void>

    goHome(): void {
      if (this.$route.name !== 'Home') this.$router.push({ name: 'Home' })
    }

    async logOutClicked(): Promise<void> {
      await this.logOut()
      this.goHome()
    }
  }
</script>

<style lang="scss" scoped>
  .navbar-brand {
    cursor: pointer;
  }
</style>
