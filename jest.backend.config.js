export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: [
    "<rootDir>/controllers/*.test.js",
    "<rootDir>/middlewares/*.test.js",
    "<rootDir>/models/*.test.js",
    "<rootDir>/config/*.test.js",
    "<rootDir>/routes/*.test.js",
    "<rootDir>/helpers/*.test.js",
    "<rootDir>/tests/integration/*.test.js"
  ],
  
  // explicitly exclude integration tests
  testPathIgnorePatterns: [
    ".*\\.integration\\.test\\.js$"
  ],

  // setup files that run before Jest is loaded
  setupFiles: [
    "<rootDir>/jest.setup.js"
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**", 
    "middlewares/**", 
    "models/**",
    "config/**",
    "routes/**",
    "helpers/**",
    "!**/*.integration.test.js"
  ],
  coverageDirectory: "coverage/backend",
  coverageReporters: ["lcov", "text", "json"],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};
