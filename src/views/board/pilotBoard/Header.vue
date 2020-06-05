<template>
  <div>
    <b-breadcrumb data-cy="breadcrumbs" :items="breadcrumbs" />

    <div class="mb-5 d-flex flex-wrap align-items-center">
      <h1 class="flex-grow-1" data-cy="pilotBoardTitle">{{pilot}}</h1>

      <div class="flex-grow-0" v-if="isMySquadron">
        <b-button-group>
          <b-button @click="rename" data-cy="renameButton">
            {{$t('pilotBoard.actions.rename')}}
          </b-button>

          <b-dropdown :text="$t('pilotBoard.actions.merge')" data-cy="mergeButton" right>
            <b-dropdown-item @click="confirmMerge(name)" v-for="name in otherPilots" :key="name">
              {{name}}
            </b-dropdown-item>
          </b-dropdown>

          <b-button @click="confirmDelete" data-cy="deletePilotButton" variant="danger">
            {{$t('pilotBoard.actions.delete')}}
          </b-button>
        </b-button-group>
      </div>
    </div>

    <rename-modal :pilot="pilot" />
    <merge-modal :predator="mergeTarget" :prey="pilot" />
  </div>
</template>

<script lang="ts">
  import Component, { mixins } from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'
  import { Action, Getter } from 'vuex-class'
  import { Squadron } from '@/types'
  import RenameModal from '@/views/board/pilotBoard/RenameModal.vue'
  import MergeModal from '@/views/board/pilotBoard/MergeModal.vue'
  import AuthCheck from '@/mixins/AuthCheck'

  @Component({
    components: { MergeModal, RenameModal }
  })
  export default class Header extends mixins(AuthCheck) {
    @Prop({ type: Object, required: true }) squadron!: Squadron

    @Prop({ type: String, required: true }) pilot!: string

    @Getter pilotNames!: string[]

    @Getter mySquadron!: Squadron | null

    @Action deletePilot!: (args: { pilot: string }) => Promise<void>

    @Action loadPasses!: (args: { squadron: string; page?: number }) => Promise<void>

    mergeTarget: string | null = null

    get breadcrumbs(): Array<unknown> {
      return [
        {
          text: this.squadron.name,
          to: { name: 'SquadronBoard', squadron: this.squadron.username }
        },
        { text: this.pilot, active: true }
      ]
    }

    get otherPilots(): string[] {
      return this.pilotNames.filter(name => name !== this.pilot)
    }

    rename(): void {
      this.$bvModal.show('rename-modal')
    }

    confirmMerge(pilot: string): void {
      this.mergeTarget = pilot
      this.$bvModal.show('merge-pilot-modal')
    }

    async confirmDelete(): Promise<void> {
      const shouldDelete: boolean = await this.$bvModal.msgBoxConfirm(
        <string> this.$t('pilotBoard.deleteConfirmModal.message', [this.pilot]),
        {
          title: <string> this.$t('pilotBoard.deleteConfirmModal.title'),
          okTitle: <string> this.$t('pilotBoard.deleteConfirmModal.okButton'),
          okVariant: 'danger'
        }
)

      if (shouldDelete) {
        try {
          await this.deletePilot({ pilot: this.pilot })
          await this.loadPasses({ squadron: this.squadron.username })
          await this.$router.push({
            name: 'SquadronBoard',
            params: { squadron: this.squadron.username }
          })
        } catch (error) {
          await this.$bvModal.msgBoxOk(error.message, {
            title: <string> this.$t('errorModal')
          })
        }
      }
    }
  }
</script>
