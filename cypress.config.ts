import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'

export default defineConfig({
  projectId: 'fkaj3f',
  fixturesFolder: 'tests/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  e2e: {
    setupNodeEvents(on) {
      on('file:preprocessor', vitePreprocessor({
        viteConfig: {
          build: {
            sourcemap: 'inline',
          },
        },
      }))
    },
    baseUrl: 'http://localhost:5100',
    specPattern: 'tests/e2e/specs/**/*.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/e2e.ts'
  }
})
