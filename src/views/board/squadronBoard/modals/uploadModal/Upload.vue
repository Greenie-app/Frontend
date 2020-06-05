<template>
  <b-container data-cy="upload">
    <b-row class="align-items-center">
      <b-col class="flex-grow-0 mr-2">
        <b-img class="document-icon" src="./../../../../../assets/images/document.svg" />
      </b-col>
      <b-col class="flex-grow-1">
        <i18n class="my-0" path="uploadModal.logfile.title" tag="p">
          <template #date>
            <strong>{{logfile.createdAt | date}}</strong>
          </template>
          <template #size>{{logfile.files[0].byteSize | size}}</template>
        </i18n>
        <p :class="{'text-danger': isFailed}" class="my-0" data-cy="uploadStatus">
          <b-spinner small v-if="isLoading" />
          <small>{{$t(`uploadModal.logfile.state.${logfile.state}`)}}</small>
        </p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import { DateTime } from 'luxon'
  import numeral from 'numeral'
  import { Logfile, LogfileState } from '@/types'

  @Component({
    filters: {
      date(date: DateTime) {
        return date.toLocaleString(DateTime.DATETIME_MED)
      },
      size(bytes: number) {
        return numeral(bytes).format('0,0 b')
      }
    }
  })
  export default class Upload extends Vue {
    @Prop({ type: Object, required: true }) logfile!: Logfile

    get isLoading(): boolean {
      return this.logfile.state === LogfileState.InProgress
    }

    get isFailed(): boolean {
      return this.logfile.state === LogfileState.Failed
    }
  }
</script>

<style lang="scss" scoped>
  .document-icon {
    width: 32px;
  }
</style>
