<template>
  <b-container>
    <b-row align-v="center" align-h="center">
      <b-spinner variant="secondary" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'

  /** Renders a more-or-less full-page spinner. */

  @Component
  export default class Spinner extends Vue {
  }
</script>
