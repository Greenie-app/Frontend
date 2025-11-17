import { computed } from 'vue'
import { isNull } from 'lodash-es'
import { useRootStore } from '@/stores/root'
import { useMySquadronStore } from '@/stores/mySquadron'

/**
 * Composable that provides the isMySquadron check (squadron is guaranteed to be loaded).
 */
export function useAuthCheckRequiredSquadron() {
  const rootStore = useRootStore()
  const mySquadronStore = useMySquadronStore()

  /**
   * @return Whether or not the currently-shown squadron is the same as the logged-in squadron.
   */
  const isMySquadron = computed(
    () =>
      !isNull(mySquadronStore.mySquadron) &&
      rootStore.squadron!.ID === mySquadronStore.mySquadron.ID,
  )

  return {
    isMySquadron,
  }
}
