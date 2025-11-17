/// <reference types="vite/client" />

import { createI18n } from 'vue-i18n'
import messages from '@/i18n/messages'
import numberFormats from '@/i18n/numberFormats'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: navigator.language,
  fallbackLocale: 'en',
  messages,
  numberFormats,
  missingWarn: false,
  fallbackWarn: false,
})

// Vite HMR for i18n messages
if (import.meta.hot) {
  import.meta.hot.accept(['./en/messages'], async (modules: unknown) => {
    if (modules && Array.isArray(modules)) {
      const newModule = modules[0]
      if (newModule && 'default' in newModule) {
        i18n.global.setLocaleMessage('en', newModule.default)
      }
    }
  })
  import.meta.hot.accept(['./en/numberFormats'], async (modules: unknown) => {
    if (modules && Array.isArray(modules)) {
      const newModule = modules[0]
      if (newModule && 'default' in newModule) {
        i18n.global.setNumberFormat('en', newModule.default)
      }
    }
  })
}

export default i18n
