<template>
  <must-be-unauthenticated>
    <n-space vertical size="large">
      <jumbotron />
      <narrow v-if="signUpShown">
        <n-space vertical>
          <h3>{{ $t("home.signUp.header") }}</h3>
          <sign-up />
        </n-space>
      </narrow>
      <n-space v-else justify="center" :size="32">
        <n-button @click="signUpShown = true" data-cy="signUpButton" size="large" type="primary">
          {{ $t("home.signUpButton") }}
        </n-button>
      </n-space>
    </n-space>
  </must-be-unauthenticated>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NButton, NSpace } from "naive-ui";
import Jumbotron from "@/views/home/Jumbotron.vue";
import SignUp from "@/views/home/SignUp.vue";
import Narrow from "@/components/Narrow.vue";
import MustBeUnauthenticated from "@/components/MustBeUnauthenticated.vue";

const signUpShown = ref(false);
</script>
