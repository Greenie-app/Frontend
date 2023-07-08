<template>
  <div>
    <p v-if="hasBoardingRate">{{$t('squadronBoard.boardingRate', [boardingRate])}}</p>
    <b-table
      :fields="tableFields"
      :items="passes"
      :per-page="0"
      :tbody-tr-class="rowClass"
      data-cy="pilotBoardTable"
      id="pilot-table"
      responsive
      sticky-header>
      <template #cell(time)="data">
        <i18n path="pilotBoard.zuluTime">
          <template #time>{{data.item.time | time}}</template>
        </i18n>
      </template>

      <template #cell(grade)="data">
        {{$t('pass.grade')[data.item.grade]}}
      </template>

      <template #cell(score)="data">
        {{data.item.score | score}}
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Getter } from 'vuex-class'
  import { BvTableFieldArray } from 'bootstrap-vue/src/components/table'
  import { isEmpty, isNull } from 'lodash-es'
  import { Prop } from 'vue-property-decorator'
  import { DateTime } from 'luxon'
  import numeral from 'numeral'
  import { variant } from '@/config/utils'
  import { Pass, Squadron } from '@/types'

  @Component({
    filters: {
      time(time: DateTime): string {
        return time.toLocaleString({
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
          timeZone: 'UTC'
        })
      }
    }
  })
  export default class Table extends Vue {
    @Getter passesForPilot!: (name: string) => Pass[]

    @Prop({ type: Object, required: true }) readonly squadron!: Squadron

    @Prop({ type: String, required: true }) readonly pilot!: string

    get passes(): Pass[] {
      return this.passesForPilot(this.pilot)
    }

    get hasBoardingRate(): boolean {
      return !isEmpty(this.passes)
    }

    get boardingRate(): string {
      const rate = this.passes.filter(p => p.trap).length / this.passes.length
      return numeral(rate).format('0.00')
    }

    get tableFields(): BvTableFieldArray {
      return [
        { key: 'time', label: <string> this.$t('pilotBoard.tableHeaders.time') },
        { key: 'shipName', label: <string> this.$t('pilotBoard.tableHeaders.shipName') },
        { key: 'aircraftType', label: <string> this.$t('pilotBoard.tableHeaders.aircraftType') },
        { key: 'grade', label: <string> this.$t('pilotBoard.tableHeaders.grade') },
        { key: 'score', label: <string> this.$t('pilotBoard.tableHeaders.score') },
        { key: 'wire', label: <string> this.$t('pilotBoard.tableHeaders.wire') },
        { key: 'notes', label: <string> this.$t('pilotBoard.tableHeaders.notes') }
      ]
    }

    rowClass(item: Pass): string | null {
      const color = variant(item)
      if (isNull(color)) return null
      return `table-${color}`
    }
  }
</script>

<style lang="scss">
  #pilot-table {
    td,
    td * {
      white-space: nowrap;
    }
  }
</style>
