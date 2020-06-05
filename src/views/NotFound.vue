<template>
  <div>
    <h1>{{$t('notFound.header')}}</h1>
    <p>{{$t('notFound.message')}}</p>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'

  @Component
  export default class NotFound extends Vue {
  }
</script>
