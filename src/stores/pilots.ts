import { defineStore } from "pinia";
import { Ok, Result } from "ts-results";
import { useRootStore } from "./root";
import type { APIResponse, Errors } from "@/stores/types";
import { ignoreResponseBodyOrThrowError, loadResponseBodyOrReturnErrors } from "@/stores/utils";

export const usePilotsStore = defineStore("pilots", () => {
  const rootStore = useRootStore();

  /**
   * Merges two pilots, copying all Passes from the "prey" to the "predator" and then deleting the
   * "prey".
   *
   * @param predator The name of the pilot that will receive the Passes.
   * @param prey The name of the pilot that will be deleted.
   */
  async function mergePilots({
    predator,
    prey,
  }: {
    predator: string;
    prey: string;
  }): Promise<void> {
    const result: APIResponse<void> = await rootStore.requestJSON({
      method: "post",
      path: `/squadron/pilots/${predator}/merge.json?other=${prey}`,
    });
    return ignoreResponseBodyOrThrowError(result);
  }

  /**
   * Deletes a pilot and all their passes.
   *
   * @param pilot The name of the pilot to delete.
   */
  async function deletePilot({ pilot }: { pilot: string }): Promise<void> {
    const result: APIResponse<void> = await rootStore.requestJSON({
      method: "delete",
      path: `/squadron/pilots/${pilot}`,
    });
    return ignoreResponseBodyOrThrowError(result);
  }

  /**
   * Renames a pilot.
   *
   * @param oldName The name of the pilot to rename.
   * @param newName The new name.
   * @return A Result containing nothing if successful, or validation errors if failed.
   */
  async function renamePilot({
    oldName,
    newName,
  }: {
    oldName: string;
    newName: string;
  }): Promise<Result<void, Errors>> {
    const result: APIResponse<void> = await rootStore.requestJSON({
      method: "put",
      path: `/squadron/pilots/${encodeURIComponent(oldName)}.json`,
      body: { name: newName },
    });
    const bodyResult = await loadResponseBodyOrReturnErrors(result);
    if (bodyResult.ok) {
      // Note: Original had RENAME_PILOT mutation, but it's not clear what it did
      // May need to update squadron data after rename
      return new Ok(undefined);
    }
    return bodyResult;
  }

  return {
    mergePilots,
    deletePilot,
    renamePilot,
  };
});
