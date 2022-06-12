import Vue from 'vue'
import Bugsnag, { Plugin } from '@bugsnag/js'
import BugsnagPluginVue from '@bugsnag/plugin-vue'

import VueRouter from 'vue-router'
import router from './router'
import store from './store'
import secrets from '@/config/secrets'
import '@/assets/styles/bootstrap.scss'
import i18n from '@/i18n'
import Layout from '@/views/Layout.vue'
import '@/config/bootstrap'
import '@/config/filters'

if (secrets.bugsnagAPIKey !== 'disabled') {
  Bugsnag.start({
    apiKey: secrets.bugsnagAPIKey,
    plugins: [<Plugin> new BugsnagPluginVue(Vue)]
  })

  Vue.config.productionTip = false
}

Vue.use(VueRouter)

new Vue({
  router,
  store,
  i18n,
  render: h => h(Layout),
  beforeCreate() { this.$store.dispatch('initialize') }
}).$mount('#app')
