<template>
  <squadron-must-be-loaded>
    <router-view />
  </squadron-must-be-loaded>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Action, Getter } from 'vuex-class'
  import { get, isNull } from 'lodash-es'
  import { Watch } from 'vue-property-decorator'
  import { Squadron } from '@/types'
  import SquadronMustBeLoaded from '@/components/SquadronMustBeLoaded.vue'

  @Component({
    components: { SquadronMustBeLoaded }
  })
  export default class SquadronLayout extends Vue {
    @Getter squadron!: Squadron | null

    @Action loadSquadron!: (args: { username: string | null }) => Promise<void>

    @Action loadPasses!: ({ squadron, page }: { squadron: string; page?: number })
      => Promise<void>

    private get routeUsername(): string | null {
      return get(this.$route, ['params', 'squadron'], null)
    }

    mounted(): void {
      this.onRouteUsernameChanged()
    }

    @Watch('routeUsername')
    async onRouteUsernameChanged(): Promise<void> {
      if (this.squadron?.username !== this.routeUsername) {
        await this.loadSquadron({ username: this.routeUsername })
        if (!isNull(this.squadron)) {
          await this.loadPasses({ squadron: this.squadron.username })
        }
      }
    }
  }
</script>
