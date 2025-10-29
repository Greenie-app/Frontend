import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  concat,
  get,
  has,
  isEmpty,
  isNull,
  isUndefined,
  keys,
  max,
  some,
  sortBy,
  values,
} from "lodash-es";
import { Ok, Result } from "ts-results";
import type { Consumer, Subscription } from "@rails/actioncable";
import { useRootStore } from "./root";
import { useAuthStore } from "./auth";
import { useMySquadronStore } from "./mySquadron";
import type { APIResponse, Errors } from "@/stores/types";
import type { Pass } from "@/types";
import { passFromJSON, type PassJSONDown, passToJSON } from "@/stores/coding";
import {
  ignoreResponseBodyOrThrowError,
  loadResponseBodyOrReturnErrors,
  loadResponseBodyOrThrowError,
} from "@/stores/utils";

let passesSubscription: Subscription | null = null;

export const usePassesStore = defineStore("passes", () => {
  const passes = ref<Pass[] | null>(null);
  const passesLoading = ref(false);
  const passesError = ref<Error | null>(null);
  const passCurrentPage = ref(1);
  const passCount = ref(0);

  const passesLoaded = computed(
    () => !isNull(passes.value) && !passesLoading.value && isNull(passesError.value),
  );

  const passesByPilot = computed((): [string | null, Pass[]][] => {
    if (isNull(passes.value)) return [];

    const passesByPilot: Record<string, Pass[]> = passes.value.reduce(
      (dict, pass) => {
        if (isNull(pass.pilot)) return dict;
        if (!has(dict, pass.pilot)) dict[pass.pilot] = [];
        dict[pass.pilot]!.push(pass);
        return dict;
      },
      {} as Record<string, Pass[]>,
    );

    const collator = new Intl.Collator(navigator.language);
    const pilots = keys(passesByPilot).sort((a, b) => collator.compare(a, b));
    const pilotsAndPasses: [string | null, Pass[]][] = pilots.map((pilot) => [
      pilot,
      sortBy(passesByPilot[pilot], (p) => p.time.diffNow().milliseconds),
    ]);

    const unknownPasses = sortBy(
      passes.value.filter((pass) => isNull(pass.pilot)),
      (p) => -p.time.diffNow().milliseconds,
    );
    if (!isEmpty(unknownPasses)) {
      pilotsAndPasses.push([null, unknownPasses]);
    }

    return pilotsAndPasses;
  });

  const passesForPilot = computed(() => (pilot: string): Pass[] => {
    if (isNull(passes.value)) return [];
    return passes.value.filter((p) => p.pilot === pilot);
  });

  const maxPassesForPilot = computed(() => {
    if (isNull(passes.value)) return 0;
    const passCounts: Record<string, number> = passes.value.reduce(
      (dict, pass) => {
        const key = get(pass, "pilot.name", "");
        if (!has(dict, key)) dict[key] = 0;
        dict[key]! += 1;
        return dict;
      },
      {} as Record<string, number>,
    );

    return max(values(passCounts)) || 0;
  });

  const noPasses = computed(() => isEmpty(passes.value));

  const pilotNames = computed((): string[] => {
    if (isNull(passes.value)) return [];
    const names = passes.value.reduce((set, pass) => {
      if (isNull(pass.pilot)) return set;
      return new Set<string>([...set, pass.pilot]);
    }, new Set<string>());
    return [...names];
  });

  function createPassesSubscription(consumer: Consumer) {
    if (passesSubscription) passesSubscription.unsubscribe();
    passesSubscription = consumer.subscriptions.create("PassesChannel", {
      received(passJSON: string) {
        passesSubscriptionMessage({ passJSON: JSON.parse(passJSON) });
      },
    });
  }

  function passesSubscriptionMessage({ passJSON }: { passJSON: PassJSONDown }) {
    updatePassesFromSubscription({ passJSON });

    const rootStore = useRootStore();
    if (passJSON.squadron) {
      rootStore.updateSquadronFromSubscription(passJSON.squadron);
    }
  }

  function updatePassesFromSubscription({ passJSON }: { passJSON: PassJSONDown }) {
    if (isNull(passes.value)) return;

    if (passJSON["destroyed?"]) {
      passes.value = passes.value.filter((p) => p.ID !== passJSON.id);
    } else if (some(passes.value, (p) => p.ID === passJSON.id)) {
      passes.value = [...passes.value.filter((p) => p.ID !== passJSON.id), passFromJSON(passJSON)];
    } else {
      if (passCurrentPage.value !== 1) return;
      passes.value = concat(passes.value, passFromJSON(passJSON));
    }
  }

  /**
   * Loads Passes for a squadron. Can be paginated.
   *
   * @param squadron The Squadron to load passes for.
   * @param page The page number to load (1-based, default 1).
   */
  async function loadPasses({
    squadron,
    page,
  }: {
    squadron: string;
    page?: number;
  }): Promise<void> {
    if (passesLoading.value) return;

    const authStore = useAuthStore();
    const rootStore = useRootStore();

    if (passesSubscription) passesSubscription.unsubscribe();
    if ((isUndefined(page) || page === 1) && authStore.actionCableConsumer) {
      createPassesSubscription(authStore.actionCableConsumer);
    }

    passes.value = null;
    passesError.value = null;
    passesLoading.value = true;
    passCurrentPage.value = 1;
    passCount.value = 0;

    try {
      const result: APIResponse<PassJSONDown[]> = await rootStore.requestJSON({
        path: `/squadrons/${squadron}/passes.json?page=${page || 1}`,
      });
      const passesData = loadResponseBodyOrThrowError(result).map((pass) => passFromJSON(pass));
      passes.value = passesData;
      passesLoading.value = false;

      const { headers } = result.val.response;
      const currentPage = headers.has("X-Page") ? Number.parseInt(headers.get("X-Page")!, 10) : 1;
      const count = headers.has("X-Count") ? Number.parseInt(headers.get("X-Count")!, 10) : 1;
      passCurrentPage.value = currentPage;
      passCount.value = count;
    } catch (error: unknown) {
      if (error instanceof Error) {
        passesError.value = error;
        passesLoading.value = false;
      } else {
        throw error;
      }
    }
  }

  /**
   * Adds a pass for the logged-in Squadron.
   * @param pass Pass data to save.
   * @return A Result containing the new Pass if successful, or validation errors if failed.
   */
  async function createPass({ pass }: { pass: Omit<Pass, "ID"> }): Promise<Result<Pass, Errors>> {
    const rootStore = useRootStore();

    const result: APIResponse<PassJSONDown> = await rootStore.requestJSON({
      method: "post",
      path: "/squadron/passes.json",
      body: { pass: passToJSON(pass) },
    });

    const passResult = await loadResponseBodyOrReturnErrors(result);
    if (passResult.ok) return new Ok(passFromJSON(passResult.val));
    return passResult;
  }

  /**
   * Updates a Pass using local data.
   *
   * @param pass The Pass to update and the data to update it with.
   * @return A Result containing the new Pass if successful, or validation errors if failed.
   */
  async function updatePass({ pass }: { pass: Pass }): Promise<Result<Pass, Errors>> {
    const rootStore = useRootStore();

    const result: APIResponse<PassJSONDown> = await rootStore.requestJSON({
      method: "put",
      path: `/squadron/passes/${pass.ID}.json`,
      body: { pass: passToJSON(pass) },
    });

    const passResult = await loadResponseBodyOrReturnErrors(result);
    if (passResult.ok) {
      const changedPass = passFromJSON(passResult.val);

      if (!isNull(passes.value)) {
        const index = passes.value.findIndex((p) => p.ID === pass.ID);
        if (index !== -1) {
          passes.value = [
            ...passes.value.slice(0, index),
            changedPass,
            ...passes.value.slice(index + 1),
          ];
        }
      }

      return new Ok(changedPass);
    }
    return passResult;
  }

  /**
   * Deletes a pass.
   *
   * @param pass The Pass to delete.
   * @return The deleted Pass returned from the backend.
   */
  async function deletePass({ pass }: { pass: Pass }): Promise<Pass> {
    const rootStore = useRootStore();
    const mySquadronStore = useMySquadronStore();

    const result: APIResponse<PassJSONDown> = await rootStore.requestJSON({
      method: "delete",
      path: `/squadron/passes/${pass.ID}.json`,
    });

    const passResponse = loadResponseBodyOrThrowError(result);
    if (!isNull(mySquadronStore.mySquadron)) {
      await loadPasses({ squadron: mySquadronStore.mySquadron.username });
    }
    return passFromJSON(passResponse);
  }

  /**
   * Deletes all passes not associated with a pilot.
   */
  async function deleteAllUnknown(): Promise<void> {
    const rootStore = useRootStore();
    const mySquadronStore = useMySquadronStore();

    const result: APIResponse<void> = await rootStore.requestJSON({
      method: "delete",
      path: "/squadron/passes/unknown.json",
    });

    await ignoreResponseBodyOrThrowError(result);

    if (!isNull(mySquadronStore.mySquadron)) {
      return loadPasses({ squadron: mySquadronStore.mySquadron.username });
    }
    return undefined;
  }

  function renamePilot({ oldName, newName }: { oldName: string; newName: string }) {
    if (isNull(passes.value)) return;
    passes.value = passes.value.map((pass) => ({
      ...pass,
      pilot: pass.pilot === oldName ? newName : pass.pilot,
    }));
  }

  function resetPasses() {
    passes.value = null;
    passesError.value = null;
    passesLoading.value = false;
    passCurrentPage.value = 1;
    passCount.value = 0;
  }

  return {
    passes: computed(() => passes.value),
    passesLoading: computed(() => passesLoading.value),
    passesError: computed(() => passesError.value),
    passCurrentPage: computed(() => passCurrentPage.value),
    passCount: computed(() => passCount.value),
    passesLoaded,
    passesByPilot,
    passesForPilot,
    maxPassesForPilot,
    noPasses,
    pilotNames,
    loadPasses,
    createPass,
    updatePass,
    deletePass,
    deleteAllUnknown,
    renamePilot,
    resetPasses,
  };
});
