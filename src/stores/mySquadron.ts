import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { isNull } from "lodash-es";
import { Ok, Result } from "ts-results";
import { useRootStore } from "./root";
import { useAuthStore } from "./auth";
import type { APIResponse, Errors } from "@/stores/types";
import type { Squadron } from "@/types";
import { squadronFromJSON, type SquadronJSONDown } from "@/stores/coding";
import { loadResponseBodyOrReturnErrors, loadResponseBodyOrThrowError } from "@/stores/utils";

export const useMySquadronStore = defineStore("mySquadron", () => {
  const mySquadron = ref<Squadron | null>(null);
  const mySquadronLoading = ref(false);
  const mySquadronError = ref<Error | null>(null);

  const mySquadronComputed = computed(() =>
    mySquadronLoading.value || mySquadronError.value ? null : mySquadron.value,
  );

  const mySquadronLoaded = computed(
    () => !isNull(mySquadron.value) && isNull(mySquadronError.value) && !mySquadronLoading.value,
  );

  /**
   * Loads data for the currently logged-in Squadron.
   */
  async function loadMySquadron(): Promise<void> {
    if (mySquadronLoading.value) return;

    const authStore = useAuthStore();
    const rootStore = useRootStore();

    if (isNull(authStore.currentUsername)) {
      mySquadron.value = null;
      mySquadronLoading.value = false;
      return;
    }

    mySquadronLoading.value = true;
    mySquadron.value = null;
    mySquadronError.value = null;

    try {
      const result: APIResponse<SquadronJSONDown> = await rootStore.requestJSON({
        path: `/squadrons/${authStore.currentUsername}.json`,
      });
      const squadron = loadResponseBodyOrThrowError(result);
      mySquadron.value = squadronFromJSON(squadron);
      mySquadronLoading.value = false;
    } catch (error: unknown) {
      if (error instanceof Error) {
        mySquadronError.value = error;
        mySquadronLoading.value = false;
      } else {
        throw error;
      }
    }
  }

  /**
   * Changes the attributes of the logged-in Squadron.
   *
   * @param body The form data.
   * @return A Result containing the updated Squadron if successful, or validation errors if failed.
   */
  async function updateMySquadron({ body }: { body: FormData }): Promise<Result<Squadron, Errors>> {
    const rootStore = useRootStore();

    try {
      const result: APIResponse<SquadronJSONDown> = await rootStore.requestJSON({
        method: "put",
        path: "/squadron.json",
        body,
      });
      const squadronResult = await loadResponseBodyOrReturnErrors(result);

      if (squadronResult.ok) {
        const changedSquadron = squadronFromJSON(squadronResult.val);
        mySquadron.value = changedSquadron;
        mySquadronLoading.value = false;
        return new Ok(changedSquadron);
      }
      return squadronResult;
    } catch (error: unknown) {
      mySquadronError.value = error as Error;
      throw error;
    }
  }

  function initialize(storedState: { mySquadron: Squadron | null }) {
    mySquadron.value = storedState.mySquadron;
  }

  return {
    mySquadron: mySquadronComputed,
    mySquadronLoading: computed(() => mySquadronLoading.value),
    mySquadronError: computed(() => mySquadronError.value),
    mySquadronLoaded,
    loadMySquadron,
    updateMySquadron,
    initialize,
  };
});
