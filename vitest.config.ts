import { fileURLToPath, URL } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'tests/e2e/**', '**/secrets.test.ts'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    setupFiles: ['tests/unit/polyfills.ts', 'tests/unit/setup.ts'],
    globals: true,
    env: {
      NODE_ENV: 'test'
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    }
  },
})
