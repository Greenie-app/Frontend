<template>
  <must-be-unauthenticated>
    <div>
      <narrow>
        <h3 class="mb-5">{{$t('logIn.header')}}</h3>
        <log-in-form />
        <p class="mt-5">{{$t('logIn.help')}}</p>
      </narrow>
    </div>
  </must-be-unauthenticated>
</template>


<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import Form from '@/views/account/logIn/Form.vue'
  import MustBeUnauthenticated from '@/components/MustBeUnauthenticated.vue'
  import Narrow from '@/components/Narrow.vue'

  @Component({
    components: { Narrow, MustBeUnauthenticated, LogInForm: Form }
  })
  export default class LogIn extends Vue {
  }
</script>
