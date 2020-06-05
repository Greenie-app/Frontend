<template>
  <b-modal id="upload-modal" hide-footer :title="$t('uploadModal.title')">
    <upload-form />
    <hr />
    <upload-list />
  </b-modal>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import UploadForm from '@/views/board/squadronBoard/modals/uploadModal/UploadForm.vue'
  import UploadList from '@/views/board/squadronBoard/modals/uploadModal/UploadList.vue'

  @Component({
    components: { UploadList, UploadForm }
  })
  export default class UploadModal extends Vue {
  }
</script>
