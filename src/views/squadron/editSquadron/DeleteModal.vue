<template>
  <b-modal :cancel-title="$t('editSquadron.confirmDelete.cancelButton')"
           :ok-title="$t('editSquadron.confirmDelete.okButton')"
           :title="$t('editSquadron.confirmDelete.title')"
           @ok="deleteClicked"
           id="confirm-delete"
           ok-variant="danger">
    <p class="my-4">{{$t('editSquadron.confirmDelete.text', [mySquadron.name])}}</p>
  </b-modal>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Action, Getter } from 'vuex-class'
  import { Squadron } from '@/types'

  @Component
  export default class DeleteModal extends Vue {
    @Getter mySquadron!: Squadron

    @Action deleteAccount!: () => Promise<void>

    @Action logOut!: () => Promise<void>

    async deleteClicked(): Promise<void> {
      await this.deleteAccount()
      await this.logOut()
      await this.$router.push({ name: 'Home' })
    }
  }
</script>
