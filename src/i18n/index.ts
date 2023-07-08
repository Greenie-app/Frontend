/* eslint-disable import/no-import-module-exports */

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from '@/i18n/messages'
import numberFormats from '@/i18n/numberFormats'

Vue.use(VueI18n)

const debug = process.env.NODE_ENV !== 'production'

const i18n = new VueI18n({
  locale: navigator.language,
  fallbackLocale: 'en',
  messages,
  numberFormats,
  silentFallbackWarn: true
})

if (debug && module.hot) {
  module.hot.accept(['./en/messages'], async () => {
    const reloadedEn = await import('./en/messages')
    i18n.setLocaleMessage('en', reloadedEn.default)
  })
  module.hot.accept(['./en/numberFormats'], async () => {
    const reloadedEn = await import('./en/numberFormats')
    i18n.setNumberFormat('en', reloadedEn.default)
  })
}

export default i18n
