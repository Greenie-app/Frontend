<template>
  <b-pagination :per-page="perPage"
                :total-rows="passCount"
                v-if="showPagination"
                v-model="page" />
  <div v-else />
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Action, Getter } from 'vuex-class'
  import { isNull } from 'lodash-es'
  import { Squadron } from '@/types'

  const perPage = 10

  @Component
  export default class Pagination extends Vue {
    @Getter passCurrentPage!: number

    @Getter passCount!: number

    @Getter squadron!: Squadron | null

    @Action loadPasses!: (args: { squadron: string; page?: number }) => Promise<void>

    get showPagination(): boolean {
      return this.passCount > perPage
    }

    get perPage(): number {
      return perPage
    }

    get page(): number {
      return this.passCurrentPage
    }

    set page(page: number) {
      if (isNull(this.squadron)) return
      this.loadPasses({ squadron: this.squadron.username, page })
    }
  }
</script>
