<template>
  <b-modal :ok-title="$t('pilotBoard.mergeConfirmModal.okButton')"
           :title="$t('pilotBoard.mergeConfirmModal.title')"
           hide-footer
           id="merge-pilot-modal"
           ok-variant="danger">
    <i18n path="pilotBoard.mergeConfirmModal.message" tag="p">
      <template #prey>
        <strong>{{prey}}</strong>
      </template>
      <template #predator>
        <strong>{{predator}}</strong>
      </template>
    </i18n>

    <b-button @click="doMerge" variant="danger" :disabled="busy" data-cy="mergeConfirmButton">
      {{$t('pilotBoard.mergeConfirmModal.okButton')}}
    </b-button>

    <p class="text-danger" v-if="error">{{error.message}}</p>
  </b-modal>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import { Action } from 'vuex-class'
  import { isNull } from 'lodash-es'

  @Component
  export default class MergeModal extends Vue {
    @Prop({ type: String }) predator!: string | null

    @Prop({ type: String, required: true }) prey!: string

    @Action mergePilots!: (args: { predator: string; prey: string }) => Promise<void>

    @Action loadPasses!: (args: { squadron: string; page?: number }) => Promise<void>

    error: Error | null = null

    busy = false

    async doMerge(): Promise<void> {
      if (isNull(this.predator)) return

      this.busy = true
      try {
        await this.mergePilots({ predator: this.predator, prey: this.prey })
        await this.loadPasses({ squadron: this.$route.params.squadron })
        await this.$router.push({ name: 'SquadronBoard', params: { squadron: this.$route.params.squadron } })
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.error = error
        } else {
          throw error
        }
      } finally {
        this.busy = false
      }
    }
  }
</script>
