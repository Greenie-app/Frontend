<template>
  <must-be-authenticated>
    <narrow>
      <h3 class="mb-5">{{$t('changePassword.header')}}</h3>
      <change-password-form />
    </narrow>
  </must-be-authenticated>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import Form from '@/views/account/changePassword/Form.vue'
  import Narrow from '@/components/Narrow.vue'
  import MustBeAuthenticated from '@/components/MustBeAuthenticated.vue'

  @Component({
    components: { MustBeAuthenticated, Narrow, ChangePasswordForm: Form }
  })
  export default class ChangePassword extends Vue {
  }
</script>
