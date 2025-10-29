<template>
  <n-card>
    <h1>{{ $t("home.jumbotron.header") }}</h1>
    <n-text :depth="1" tag="p">{{ $t("home.jumbotron.lead") }}</n-text>
    <p>{{ $t("home.jumbotron.description") }}</p>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NText } from "naive-ui";
</script>
