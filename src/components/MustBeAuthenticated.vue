<template>
  <div>
    <slot v-if="loggedAndLoaded" />
    <spinner v-else-if="loggedIn" />
    <p class="text-warning mt-5" v-else>{{$t('mustBeLoggedIn')}}</p>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Getter } from 'vuex-class'
  import Spinner from '@/components/Spinner.vue'

  /** Wrap your view in this component to require that a squadron be logged in before rendering. */

  @Component({
    components: { Spinner }
  })
  export default class MustBeAuthenticated extends Vue {
    @Getter loggedIn!: boolean

    @Getter mySquadronLoaded!: boolean

    get loggedAndLoaded(): boolean {
      return this.loggedIn && this.mySquadronLoaded
    }
  }
</script>
