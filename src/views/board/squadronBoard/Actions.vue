<template>
  <b-button-group>
    <b-button @click.prevent="addPassClicked" data-cy="addPassButton">
      {{$t('squadronBoard.addPassButton')}}
    </b-button>
    <add-pass-modal />

    <b-button @click.prevent="uploadClicked" data-cy="uploadButton">
      {{$t('squadronBoard.uploadButton')}}
    </b-button>
    <upload-modal />
  </b-button-group>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import UploadModal from '@/views/board/squadronBoard/modals/UploadModal.vue'
  import AddPassModal from '@/views/board/squadronBoard/modals/AddPassModal.vue'

  @Component({
    components: { AddPassModal, UploadModal }
  })
  export default class Actions extends Vue {
    addPassClicked(): void {
      this.$bvModal.show('add-pass-modal')
    }

    uploadClicked(): void {
      this.$bvModal.show('upload-modal')
    }
  }
</script>
