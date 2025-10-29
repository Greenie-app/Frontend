import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    ...(process.env.CYPRESS ? [] : [vueDevTools()])
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
})
