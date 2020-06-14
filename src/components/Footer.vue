<template>
  <footer class="footer mt-auto py-3">
    <b-container>
      <span class="text-muted">{{$t('footer.copyright')}} </span>
      <a href="https://github.com/Greenie-app" rel="noopener" target="_blank">
        {{$t('footer.contributeLink')}}
      </a>
    </b-container>
  </footer>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Component from 'vue-class-component'

  @Component
  export default class Footer extends Vue {
  }
</script>

<style lang="scss" scoped>
  footer {
    background-color: #f5f5f5;
  }
</style>
