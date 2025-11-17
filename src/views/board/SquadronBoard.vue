<template>
  <error v-if="passesStore.passesError" :error="passesStore.passesError.message" />

  <n-space vertical v-else-if="passesStore.passesLoaded">
    <board-header :squadron="rootStore.squadron!" />

    <date-range-filter>
      <template #actions v-if="isMySquadron">
        <n-button @click="showAddPassModal = true" data-cy="addPassButton">
          <template #icon>
            <n-icon>
              <add-outline />
            </n-icon>
          </template>
          {{ $t("squadronBoard.addPassButton") }}
        </n-button>
        <add-pass-modal v-model:show="showAddPassModal" />

        <n-button @click="showUploadModal = true" data-cy="uploadButton">
          <template #icon>
            <n-icon>
              <cloud-upload-outline />
            </n-icon>
          </template>
          {{ $t("squadronBoard.uploadButton") }}
        </n-button>
        <upload-modal v-model:show="showUploadModal" />
      </template>
    </date-range-filter>

    <p v-if="passesStore.noPasses">
      {{ $t("squadronBoard.noPassesInRange") }}
    </p>
    <passes-table v-else />

    <n-space vertical style="margin-top: 1rem">
      <p v-if="hasBoardingRate" data-cy="squadronBoardingRate">
        {{ $t("squadronBoard.boardingRate", [boardingRate]) }}
      </p>
      <n-button
        v-if="isMySquadron && rootStore.unknownPassCount > 0"
        text
        type="error"
        @click="deleteAll"
        data-cy="deleteAllUnassigned"
        :loading="deleteAllBusy"
      >
        {{ $t("squadronBoard.deleteAll.link") }}
      </n-button>
    </n-space>
  </n-space>

  <spinner v-else />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { NSpace, NButton, NIcon, useDialog } from "naive-ui";
import { AddOutline, CloudUploadOutline } from "@vicons/ionicons5";
import { isNull } from "lodash-es";
import numeral from "numeral";
import { DateTime } from "luxon";
import { useRootStore } from "@/stores/root";
import { usePassesStore } from "@/stores/passes";
import { useAuthCheck } from "@/composables/useAuthCheck";
import Error from "@/components/Error.vue";
import Spinner from "@/components/Spinner.vue";
import PassesTable from "@/views/board/squadronBoard/Table.vue";
import BoardHeader from "@/views/board/squadronBoard/Header.vue";
import DateRangeFilter from "@/views/board/squadronBoard/DateRangeFilter.vue";
import AddPassModal from "@/views/board/squadronBoard/modals/AddPassModal.vue";
import UploadModal from "@/views/board/squadronBoard/modals/UploadModal.vue";

const { t } = useI18n();
const dialog = useDialog();
const route = useRoute();
const router = useRouter();
const rootStore = useRootStore();
const passesStore = usePassesStore();
const { isMySquadron } = useAuthCheck();

// Parse date range from URL parameters
function getDateRangeFromUrl(): { start: DateTime; end: DateTime } | null {
  const fromParam = route.query.from as string | undefined;
  const toParam = route.query.to as string | undefined;

  if (fromParam && toParam) {
    const start = DateTime.fromISO(fromParam);
    const end = DateTime.fromISO(toParam);

    if (start.isValid && end.isValid) {
      return { start: start.startOf("day"), end: end.endOf("day") };
    }
  }
  return null;
}

// Update URL with current date range
function updateUrlWithDateRange(start: DateTime, end: DateTime) {
  const fromDate = start.toISODate();
  const toDate = end.toISODate();

  if (fromDate && toDate) {
    router.replace({
      query: {
        ...route.query,
        from: fromDate,
        to: toDate,
      },
    });
  }
}

// Load passes when component mounts
onMounted(() => {
  // Check for URL parameters first
  const urlDateRange = getDateRangeFromUrl();

  // Update URL with current date range if no parameters were present
  if (!urlDateRange) {
    updateUrlWithDateRange(passesStore.startDate, passesStore.endDate);
  }

  // Skip auto-load in Cypress environment unless URL has explicit date parameters
  // This allows tests to control data loading via nDateRange, but respects URL params on reload
  if ((window as any).Cypress && !urlDateRange) {
    return;
  }

  if (rootStore.squadron && !passesStore.passesLoaded && !passesStore.passesLoading) {
    const dateRange = urlDateRange || {
      start: passesStore.startDate,
      end: passesStore.endDate,
    };

    passesStore.loadPasses({
      squadron: rootStore.squadron.username,
      dateRange,
    });
  }
});

// Watch for squadron changes to reload with current date range
watch(
  () => rootStore.squadron,
  (squadron, oldSquadron) => {
    // Skip auto-load in Cypress environment to allow tests to control data loading
    if ((window as any).Cypress) {
      return;
    }

    if (squadron && squadron !== oldSquadron && !passesStore.passesLoading) {
      passesStore.loadPasses({
        squadron: squadron.username,
        dateRange: {
          start: passesStore.startDate,
          end: passesStore.endDate,
        },
      });
    }
  },
);

// Watch for store date changes to update URL
watch(
  () => [passesStore.startDate, passesStore.endDate],
  ([newStart, newEnd]) => {
    if (
      newStart instanceof DateTime &&
      newEnd instanceof DateTime &&
      newStart.isValid &&
      newEnd.isValid
    ) {
      updateUrlWithDateRange(newStart, newEnd);
    }
  },
);

const showAddPassModal = ref(false);
const showUploadModal = ref(false);
const deleteAllBusy = ref(false);

const boardingRate = computed(() => {
  if (isNull(passesStore.boardingRate)) return "";
  return numeral(passesStore.boardingRate).format("0.00");
});

const hasBoardingRate = computed(() => !isNull(passesStore.boardingRate));

async function deleteAll(): Promise<void> {
  return new Promise((resolve) => {
    dialog.warning({
      title: t("squadronBoard.deleteAll.title"),
      content: t("squadronBoard.deleteAll.confirm.message", { count: rootStore.unknownPassCount }),
      positiveText: t("squadronBoard.deleteAll.confirm.okButton"),
      negativeText: t("editSquadron.confirmDelete.cancelButton"),
      onPositiveClick: async () => {
        deleteAllBusy.value = true;
        try {
          await passesStore.deleteAllUnknown();
          resolve();
        } catch {
          dialog.error({
            title: t("squadronBoard.deleteAll.title"),
            content: t("squadronBoard.deleteAll.error.message"),
            positiveText: t("squadronBoard.deleteAll.error.okButton"),
          });
        } finally {
          deleteAllBusy.value = false;
        }
      },
      onNegativeClick: () => {
        resolve();
      },
    });
  });
}
</script>
