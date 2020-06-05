<template>
  <must-be-authenticated>
    <narrow>
      <h3 class="mb-5">{{$t('editSquadron.header')}}</h3>
      <edit-form />
    </narrow>
  </must-be-authenticated>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import Narrow from '@/components/Narrow.vue'
  import MustBeAuthenticated from '@/components/MustBeAuthenticated.vue'
  import Form from '@/views/squadron/editSquadron/Form.vue'

  @Component({
    components: { MustBeAuthenticated, EditForm: Form, Narrow }
  })
  export default class EditSquadron extends Vue {
  }
</script>
