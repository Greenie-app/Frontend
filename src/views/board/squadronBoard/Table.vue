<template>
  <b-table-simple responsive="sm">
    <b-tbody>
      <pass-row
        :key="pilot"
        :passes="passes"
        :pilot="pilot"
        v-for="[pilot, passes] in passesByPilot" />
    </b-tbody>
  </b-table-simple>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Getter } from 'vuex-class'
  import { Pass } from '@/types'
  import PassCell from '@/views/board/squadronBoard/table/PassCell.vue'
  import PassRow from '@/views/board/squadronBoard/table/PassRow.vue'

  @Component({
    components: { PassRow, PassCell }
  })
  export default class Table extends Vue {
    @Getter passesByPilot!: [string | null, Pass[]][]
  }
</script>
