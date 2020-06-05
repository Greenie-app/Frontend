<template>
  <div>
    <h2 class="mb-5 text-danger">{{$t('error.title')}}</h2>
    <p class="text-danger">{{error}}</p>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'
  import { Prop } from 'vue-property-decorator'

  @Component
  export default class Error extends Vue {
    @Prop({ type: String, required: true }) error!: string
  }
</script>
