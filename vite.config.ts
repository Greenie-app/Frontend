import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [vue()]

  // Only add Vue DevTools in development (and not in Cypress)
  if (mode === 'development' && !process.env.CYPRESS) {
    try {
      const { default: vueDevTools } = await import('vite-plugin-vue-devtools')
      plugins.push(vueDevTools())
    } catch (error) {
      console.warn('Vue DevTools plugin failed to load:', error)
    }
  }

  // Only add Sentry plugin in production builds
  if (mode === 'production') {
    plugins.push(
      sentryVitePlugin({
        org: 'timcodes',
        project: 'greenie-frontend',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          // Delete source maps after upload to keep them out of production
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
        release: {
          // Automatically set release name from git
          name: process.env.GITHUB_SHA,
          // Associate commits with the release
          setCommits: {
            auto: true,
          },
        },
      }),
    )
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5100,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/cable': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          ws: true,
        },
        '/login.json': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/logout.json': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/squadrons': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/squadron': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/forgot_password.json': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/cypress': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      sourcemap: mode === 'production', // Only enable source maps in production for Sentry
      rollupOptions: {
        output: {
          manualChunks: {
            'naive-ui': ['naive-ui'],
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
          },
        },
      },
    },
  }
})
