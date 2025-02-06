import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  fixturesFolder: 'test/cypress/fixtures',
  screenshotsFolder: '../../../tmp/cypress/screenshots',
  downloadsFolder: '../../../tmp/cypress/downloads',
  videosFolder: '../../../tmp/cypress/videos',
  chromeWebSecurity: true,
  viewportWidth: 1200,
  viewportHeight: 720,
  retries: 2,
  env: {
    authenticationUrl: '/api/authenticate',
    jwtStorageName: 'jhi-authenticationToken',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return (await import('./test/cypress/plugins/index')).default(on, config);
    },
    baseUrl: 'http://localhost:5000/',
    specPattern: 'test/cypress/e2e/**/*.cy.ts',
    supportFile: 'test/cypress/support/index.ts',
    experimentalRunAllSpecs: true,
  },
});
