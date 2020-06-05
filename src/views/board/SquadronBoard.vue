<template>
    <error :error="passesError.message" v-if="passesError" />

    <div v-else-if="passesLoaded">
      <board-header :squadron="squadron" />

      <p class="mb-5" v-if="noPasses">{{$t('squadronBoard.noPasses')}}</p>
      <passes-table v-else />

      <b-button-toolbar justify>
        <actions v-if="isMySquadron" />
        <pagination />
      </b-button-toolbar>
    </div>

    <spinner v-else />
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Getter } from 'vuex-class'
  import SquadronMustBeLoaded from '@/components/SquadronMustBeLoaded.vue'
  import { Squadron } from '@/types'
  import Error from '@/components/Error.vue'
  import Spinner from '@/components/Spinner.vue'
  import Table from '@/views/board/squadronBoard/Table.vue'
  import Header from '@/views/board/squadronBoard/Header.vue'
  import Actions from '@/views/board/squadronBoard/Actions.vue'
  import Pagination from '@/views/board/squadronBoard/Pagination.vue'
  import AuthCheck from '@/mixins/AuthCheck'

  @Component({
    components: {
      Pagination,
      Actions,
      BoardHeader: Header,
      PassesTable: Table,
      Spinner,
      Error,
      SquadronMustBeLoaded
    }
  })
  export default class SquadronBoard extends mixins(AuthCheck) {
    @Getter squadron!: Squadron | null

    @Getter passesLoaded!: boolean

    @Getter passesError!: Error | null

    @Getter noPasses!: boolean

    @Getter mySquadron!: Squadron | null
  }
</script>
