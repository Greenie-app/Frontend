<template>
  <div>
    <p v-if="loggedIn">{{$t('mustBeLoggedOut')}}</p>
    <slot v-else />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Getter } from 'vuex-class'
  import { Watch } from 'vue-property-decorator'
  import Spinner from '@/components/Spinner.vue'

  /** Wrap your view in this component to require that the user be logged out. */

  @Component({
    components: { Spinner }
  })
  export default class MustBeUnauthenticated extends Vue {
    @Getter loggedIn!: boolean

    @Getter currentUsername!: string | null

    @Watch('loggedIn')
    onLoggedInChanged(): void {
      if (this.loggedIn) {
        this.$router.push({
          name: 'SquadronBoard',
          params: { squadron: this.currentUsername! }
        })
      }
    }

    mounted(): void {
      this.onLoggedInChanged()
    }
  }
</script>
