<template>
  <div>
    <pilot-header :pilot="pilot" :squadron="squadron" />
    <pilot-table :pilot="pilot" :squadron="squadron" />
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Getter } from 'vuex-class'
  import SquadronMustBeLoaded from '@/components/SquadronMustBeLoaded.vue'
  import { Squadron } from '@/types'
  import Table from '@/views/board/pilotBoard/Table.vue'
  import Header from '@/views/board/pilotBoard/Header.vue'

  @Component({
    components: { PilotHeader: Header, PilotTable: Table, SquadronMustBeLoaded }
  })
  export default class PilotBoard extends Vue {
    @Getter squadron!: Squadron

    get pilot(): string {
      return this.$route.params.pilot
    }
  }
</script>
