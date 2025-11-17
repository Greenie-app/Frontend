import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'

import router from './router'
import pinia, { useRootStore } from './stores'
import i18n from '@/i18n'
import Layout from '@/views/Layout.vue'
import { scoreFilter } from '@/config/filters'

const app = createApp(Layout)

// Only initialize Sentry in production, but not during E2E tests
if (import.meta.env.PROD && !import.meta.env.VITE_DISABLE_SENTRY) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
    // Tracing
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/greenie\.app/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  })
}

// Install plugins
app.use(pinia)
app.use(router)
app.use(i18n)

// Make scoreFilter globally available
app.config.globalProperties.$filters = {
  score: scoreFilter,
}

// Initialize root store (for localStorage persistence)
const rootStore = useRootStore()
rootStore.initialize()

// Mount app
app.mount('#app')
