import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'https://homologcadastroweb.cpb.org.br/cadastro-geral-web',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    API_BASE_URL: 'https://homologcadastroweb.cpb.org.br/api/cadastro-api/v1',
    KEYCLOAK_ORIGIN: 'https://homologlogin.cpb.org.br',
  },
  chromeWebSecurity: false,
  video: false,
  trashAssetsBeforeRuns: false,
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  defaultCommandTimeout: 15000,
  pageLoadTimeout: 60000,
  responseTimeout: 30000,
  viewportWidth: 1280,
  viewportHeight: 720,
});
