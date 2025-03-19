export default {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // setup files that run before Jest is loaded
  setupFiles: [
    "<rootDir>/jest.setup.js"
  ],
  
  // setup files that run after Jest is loaded
  setupFilesAfterEnv: [
    "<rootDir>/client/src/setupTests.js"
  ],

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: ["<rootDir>/client/src/**/*.test.js"],

  // exclude directory and integration tests
  testPathIgnorePatterns: [
    "<rootDir>/tests-examples/",
    "<rootDir>/client/src/_markbind/",
    "<rootDir>/client/src/_site/",
    ".*\\.integration\\.test\\.js$"
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/**/*.js", 
    "client/src/**/*.jsx",
    "!tests-examples/**",
    "!client/src/_markbind/**",
    "!client/src/_site/**",
    "!client/src/*.js",
    "!**/*.integration.test.js"
  ],
  coverageDirectory: "coverage/frontend",
  coverageReporters: ["lcov", "text", "json"],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};
