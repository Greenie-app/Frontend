<template>
  <b-tr :data-cy-pilot="dataCy" data-cy="squadronBoardRow">
    <pass-header-cell :average="average" :pilot="pilot" />
    <pass-cell :key="pass.ID" :pass="pass" v-for="pass in passes" />
    <td :key="index" v-for="index in emptyCells">&nbsp;</td>
  </b-tr>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import {
    isEmpty, isNull, sumBy, times
  } from 'lodash-es'
  import { Getter } from 'vuex-class'
  import PassCell from './PassCell.vue'
  import { Pass } from '@/types'
  import PassHeaderCell from '@/views/board/squadronBoard/table/PassHeaderCell.vue'

  @Component({
    components: { PassHeaderCell, PassCell }
  })
  export default class PassRow extends Vue {
    @Prop({ type: String, required: false }) readonly pilot!: string | null

    @Prop({ type: Array, required: true }) readonly passes!: Pass[]

    @Getter maxPassesForPilot!: number

    get dataCy(): string {
      return isNull(this.pilot) ? 'unknown' : this.pilot.replace(/\s+/g, '')
    }

    get emptyCells(): string[] {
      return times(this.maxPassesForPilot - this.passes.length).map(index => `empty-${index}`)
    }

    get average(): number | null {
      if (isNull(this.pilot)) return null
      const scoredPasses = this.passes.filter(p => !isNull(p.score))
      if (isEmpty(scoredPasses)) return null
      return sumBy(scoredPasses, p => p.score!) / scoredPasses.length
    }
  }
</script>
