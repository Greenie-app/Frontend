<template>
  <must-be-unauthenticated>
    <div>
      <jumbotron />
      <narrow v-if="signUpShown">
        <h3 class="mb-5">{{$t('home.signUp.header')}}</h3>
        <sign-up />
      </narrow>
      <p class="text-center mt-5 pt-5" v-else>
        <b-button
          @click.prevent="signUpShown = true"
          data-cy="signUpButton"
          size="lg"
          variant="primary">
          {{$t('home.signUpButton')}}
        </b-button>
      </p>
    </div>
  </must-be-unauthenticated>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import Jumbotron from '@/views/home/Jumbotron.vue'
  import SignUp from '@/views/home/SignUp.vue'
  import Narrow from '@/components/Narrow.vue'
  import MustBeUnauthenticated from '@/components/MustBeUnauthenticated.vue'

  @Component({
    components: {
      MustBeUnauthenticated,
      Narrow,
      SignUp,
      Jumbotron
    }
  })
  export default class Home extends Vue {
    signUpShown = false
  }
</script>
