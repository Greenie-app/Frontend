<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="$t('pilotBoard.mergeConfirmModal.title')"
    style="max-width: 600px"
  >
    <n-space vertical>
      <i18n-t keypath="pilotBoard.mergeConfirmModal.message" tag="p">
        <template #prey>
          <n-text strong tag="strong">{{ prey }}</n-text>
        </template>
        <template #predator>
          <n-text strong tag="strong">{{ predator }}</n-text>
        </template>
      </i18n-t>

      <n-space>
        <n-button @click="doMerge" type="warning" :disabled="busy" data-cy="mergeConfirmButton">
          <n-spin v-if="busy" size="small" />
          <template v-else>
            {{ $t("pilotBoard.mergeConfirmModal.okButton") }}
          </template>
        </n-button>
      </n-space>

      <n-alert v-if="error" type="error">
        {{ error.message }}
      </n-alert>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { NModal, NSpace, NButton, NSpin, NAlert, NText } from "naive-ui";
import { isNull } from "lodash-es";
import { usePilotsStore } from "@/stores/pilots";
import { usePassesStore } from "@/stores/passes";

interface Props {
  predator: string | null;
  prey: string;
}

const props = defineProps<Props>();
const showModal = defineModel<boolean>("show", { default: false });

const router = useRouter();
const route = useRoute();
const pilotsStore = usePilotsStore();
const passesStore = usePassesStore();

const error = ref<Error | null>(null);
const busy = ref(false);

async function doMerge(): Promise<void> {
  if (isNull(props.predator)) return;

  error.value = null;
  busy.value = true;

  try {
    await pilotsStore.mergePilots({ predator: props.predator, prey: props.prey });
    await passesStore.loadPasses({ squadron: route.params.squadron as string });
    await router.push({
      name: "SquadronBoard",
      params: { squadron: route.params.squadron },
    });
    showModal.value = false;
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err;
    } else {
      throw err;
    }
  } finally {
    busy.value = false;
  }
}
</script>
