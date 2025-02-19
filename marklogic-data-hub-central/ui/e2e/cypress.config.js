const {defineConfig} = require("cypress");

module.exports = defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  videoCompression: 20,
  viewportWidth: 1680,
  viewportHeight: 1050,
  MOZ_FORCE_DISABLE_E10S: 1,
  numTestsKeptInMemory: 1,
  defaultCommandTimeout: 15000,
  requestTimeout: 30000,
  reporter: "junit",
  animationDistanceThreshold: 0,
  reporterOptions: {
    mochaFile: "results/cypress-report[hash].xml",
    toConsole: true,
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  env: {
    mlHost: "localhost",
    FAIL_FAST_STRATEGY: "spec",
  },
  e2e: {
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:8080",
    experimentalRunAllSpecs: true,
    testIsolation: false,
    specPattern: ["cypress/e2e/*/*/*.cy.{js,jsx,ts,tsx}", "cypress/e2e/*/*.cy.{js,jsx,ts,tsx}"],
    excludeSpecPattern: ["cypress/e2e/explore/graphFocusDefocusCluster.cy.tsx"],
    downloadsFolder: "cypress/downloads"
  },
});
