import Vue from 'vue'
import Vuex from 'vuex'

import { capitalize } from 'lodash-es'
import createLogger from 'vuex/dist/logger'
import { AnyModuleState, RootState } from '@/store/types'
import root from '@/store/modules/root'
import pilots from '@/store/modules/pilots'
import passes from '@/store/modules/passes'
import logfiles from '@/store/modules/logfiles'
import { FROZEN_MODULES } from '@/store/utils'
import account from '@/store/modules/account'
import auth from '@/store/modules/auth'
import mySquadron from '@/store/modules/mySquadron'

const debug = process.env.NODE_ENV === 'development' && !navigator.userAgent.includes('Chrome')

Vue.use(Vuex)
const store = new Vuex.Store<RootState>({
  ...root,
  modules: {
    pilots, passes, logfiles, account, auth, mySquadron
  },
  plugins: debug ? [createLogger()] : []
})

store.subscribe(() => {
  const frozenState: { [key: string]: AnyModuleState } = {}
  FROZEN_MODULES.forEach(mod => {
    const frozenMod = store.getters[`freeze${capitalize(mod)}`]
    if (frozenMod) frozenState[mod] = frozenMod
  })
  window.localStorage.setItem('store', JSON.stringify(frozenState))
})

export default store
