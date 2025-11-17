import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia

// Export all stores for easy importing
export { useRootStore } from './root'
export { useAuthStore } from './auth'
export { useAccountStore } from './account'
export { useMySquadronStore } from './mySquadron'
export { usePilotsStore } from './pilots'
export { usePassesStore } from './passes'
export { useLogfilesStore } from './logfiles'
