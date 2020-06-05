<template>
  <div>
    <error :error="squadronError.message" v-if="squadronError" />
    <slot v-else-if="squadronLoaded" />
    <spinner v-else />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Getter } from 'vuex-class'
  import Spinner from '@/components/Spinner.vue'
  import Error from '@/components/Error.vue'

  /**
   * Wrap your view with this component to require that the Squadron has finished loading, or to
   * display a {@link Spinner} if the squadron is still loading.
   */

  @Component({
    components: { Error, Spinner }
  })
  export default class SquadronMustBeLoaded extends Vue {
    @Getter squadronLoaded!: boolean

    @Getter squadronError!: Error | null
  }
</script>
