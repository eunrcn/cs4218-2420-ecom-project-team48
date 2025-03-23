export default {
  "displayName": "backend-integration",
  "testEnvironment": "node",
  "testMatch": [
    "<rootDir>/controllers/*.integration.test.js",
    "<rootDir>/middlewares/*.integration.test.js",
    "<rootDir>/models/*.integration.test.js",
    "<rootDir>/config/*.integration.test.js",
    "<rootDir>/routes/*.integration.test.js",
    "<rootDir>/helpers/*.integration.test.js",
    "<rootDir>/tests/integration/*.test.js"
  ],
  "setupFiles": [
    "<rootDir>/jest.setup.js"
  ],
  "collectCoverage": true,
  "collectCoverageFrom": [
    "controllers/**",
    "middlewares/**",
    "models/**",
    "config/**",
    "routes/**",
    "helpers/**",
    "!client/**",
    "!**/*.test.js",
    "{controllers,middlewares,models,config,routes,helpers}/**/*.integration.test.js"
  ],
  "coverageDirectory": "coverage/backend-integration",
  "coverageReporters": ["lcov", "text", "json"],
  "coverageThreshold": {
    "global": {
      "lines": 80,
      "functions": 80
    }
  }
}