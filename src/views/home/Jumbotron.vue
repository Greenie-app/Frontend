<template>
  <b-jumbotron :header="$t('home.jumbotron.header')" :lead="$t('home.jumbotron.lead')">
    <p>{{$t('home.jumbotron.description')}}</p>
  </b-jumbotron>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'

  @Component
  export default class Jumbotron extends Vue {
    signUp(): void {
      this.$router.push({ name: 'SignUp' })
    }
  }
</script>
