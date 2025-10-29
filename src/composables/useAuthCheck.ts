import { computed } from "vue";
import { isNull } from "lodash-es";
import { useRootStore } from "@/stores/root";
import { useMySquadronStore } from "@/stores/mySquadron";

/**
 * Composable that provides the isMySquadron check.
 */
export function useAuthCheck() {
  const rootStore = useRootStore();
  const mySquadronStore = useMySquadronStore();

  /**
   * @return Whether or not the currently-shown squadron is the same as the logged-in squadron.
   */
  const isMySquadron = computed(
    () =>
      !isNull(rootStore.squadron) &&
      !isNull(mySquadronStore.mySquadron) &&
      rootStore.squadron.ID === mySquadronStore.mySquadron.ID,
  );

  return {
    isMySquadron,
  };
}
