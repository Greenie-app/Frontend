<template>
  <n-layout-footer class="footer">
    <n-space justify="center">
      <span>{{ $t("footer.copyright") }} </span>
      <a href="https://github.com/Greenie-app" rel="noopener" target="_blank">
        {{ $t("footer.contributeLink") }}
      </a>
    </n-space>
  </n-layout-footer>
</template>

<script setup lang="ts">
import { NLayoutFooter, NSpace } from "naive-ui";
</script>

<style lang="scss" scoped>
.footer {
  background-color: var(--n-color-modal);
  padding: 1rem;
  margin-top: auto;
}
</style>
