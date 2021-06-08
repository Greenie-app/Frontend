<template>
  <b-th data-cy="passHeaderCell" sticky-column>
    <i18n class="my-0" path="squadronBoard.pilotAndScore" tag="p" v-if="hasAverage">
      <template #name>
        <b-link
          :to="{name: 'PilotBoard', params: {squadron: $route.params.squadron, pilot: pilot}}"
          data-cy="pilotBoardLink">
          {{pilot}}
        </b-link>
      </template>

      <template #score>{{average | score}}</template>
    </i18n>

    <p class="my-0" v-else-if="!isUnknownPilot">
      <b-link :to="{name: 'PilotBoard', params: {squadron: $route.params.squadron, pilot: pilot}}">
        {{pilot}}
      </b-link>
    </p>

    <p v-else>{{$t('unknownPilot')}}</p>

    <p class="my-0 small" v-if="isMySquadron && isUnknownPilot">
      <b-link :disabled="busy" @click.prevent="deleteAll" data-cy="deleteAllUnassigned">
        {{$t('squadronBoard.deleteAll.link')}}
      </b-link>
      <b-spinner class="ml-2" small v-if="busy" />
    </p>
  </b-th>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import { isNull } from 'lodash-es'
  import { Action, Getter } from 'vuex-class'
  import AuthCheck from '@/mixins/AuthCheck'
  import { Squadron } from '@/types'

  @Component
  export default class PassHeaderCell extends mixins(AuthCheck) {
    @Prop({ type: String, required: false }) pilot!: string | null

    @Prop({ type: Number }) average!: number | null

    @Getter squadron!: Squadron | null

    @Getter mySquadron!: Squadron | null

    @Getter unknownPassCount!: number

    @Action deleteAllUnknown!: () => Promise<void>

    busy = false

    get isUnknownPilot(): boolean {
      return isNull(this.pilot)
    }

    get hasAverage(): boolean {
      return !isNull(this.average)
    }

    async deleteAll(): Promise<void> {
      const shouldContinue = await this.$bvModal.msgBoxConfirm(
        <string> this.$t('squadronBoard.deleteAll.confirm.message', { count: this.unknownPassCount }),
        {
          title: <string> this.$t('squadronBoard.deleteAll.title'),
          okTitle: <string> this.$t('squadronBoard.deleteAll.confirm.okButton'),
          okVariant: 'danger'
        }
      )
      if (!shouldContinue) return

      this.busy = true
      try {
        await this.deleteAllUnknown()
      } catch (error: unknown) {
        await this.$bvModal.msgBoxOk(<string> this.$t('squadronBoard.deleteAll.error.message'), {
          title: <string> this.$t('squadronBoard.deleteAll.title'),
          okTitle: <string> this.$t('squadronBoard.deleteAll.error.okButton')
        })
      } finally {
        this.busy = false
      }
    }
  }
</script>
