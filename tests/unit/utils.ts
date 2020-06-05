import Vue from 'vue'
import { createLocalVue } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import Vuex, { Store } from 'vuex'
import { cloneDeep } from 'lodash-es'
import VueI18n from 'vue-i18n'
import { RootState } from '@/store/types'
import root from '@/store/modules/root'
import pilots from '@/store/modules/pilots'
import passes from '@/store/modules/passes'
import logfiles from '@/store/modules/logfiles'
import account from '@/store/modules/account'
import auth from '@/store/modules/auth'
import mySquadron from '@/store/modules/mySquadron'

export function componentLocalVue(): typeof Vue {
  const vue = createLocalVue()
  vue.use(BootstrapVue)
  vue.use(VueI18n)
  return vue
}

export function createTestStore(): Store<RootState> {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  return new Store({
    ...cloneDeep(root),
    modules: {
      pilots: cloneDeep(pilots),
      passes: cloneDeep(passes),
      logfiles: cloneDeep(logfiles),
      account: cloneDeep(account),
      auth: cloneDeep(auth),
      mySquadron: cloneDeep(mySquadron)
    }
  })
}

export function logIn(store: Store<RootState>): void {
  store.commit('SET_JWT', {
    JWT: 'eyJhbGciOiJIUzI1NiJ9.eyJ1IjoiNzJuZCIsInN1YiI6IjEiLCJzY3AiOiJzcXVhZHJvbiIsImF1ZCI6bnVsbCwiaWF0IjoxNTkxNzQ1NDc4LCJleHAiOjE1OTE4MzE4NzgsImp0aSI6ImM1YjBmOGEzLTYzMzQtNGI0NC1iYWEyLTIxMjU3MWZmMDA5NSJ9.fake-signature'
  })
}
