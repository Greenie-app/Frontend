import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(async () => {
  // Conditionally load vueDevTools to avoid localStorage issue
  let devToolsPlugin: PluginOption[] = []
  if (!process.env.CYPRESS) {
    try {
      const vueDevTools = (await import('vite-plugin-vue-devtools')).default
      devToolsPlugin = [vueDevTools()]
    } catch (error) {
      console.warn('Vue DevTools plugin failed to load:', error)
    }
  }

  return {
    plugins: [
      vue(),
      ...devToolsPlugin
    ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5100,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/cable': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true
      },
      '/login.json': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/logout.json': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/squadrons': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/squadron': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/forgot_password.json': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/cypress': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'naive-ui': ['naive-ui'],
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
}
})
