export default {
  "displayName": "frontend-integration",
  "testEnvironment": "jest-environment-jsdom",
  "transform": {
    "^.+\\.jsx?$": "babel-jest"
  },
  "moduleNameMapper": {
    "\\.(css|scss)$": "identity-obj-proxy"
  },
  "setupFiles": [
    "<rootDir>/jest.setup.js"
  ],
  "testMatch": [
    "<rootDir>/client/src/**/*.integration.test.js"
  ],
  "testPathIgnorePatterns": [
    "<rootDir>/tests-examples/",
    "<rootDir>/client/src/_markbind/",
    "<rootDir>/client/src/_site/"
  ],
  "collectCoverage": true,
  "collectCoverageFrom": [
    "client/src/**/*.js",
    "client/src/**/*.jsx",
    "!tests-examples/**",
    "!client/src/_markbind/**",
    "!client/src/_site/**",
    "!client/src/*.js",
    "!**/*.test.js",
    "**/*.integration.test.js"
  ],
  "coverageDirectory": "coverage/frontend-integration",
  "coverageReporters": ["lcov", "text", "json"],
  "coverageThreshold": {
    "global": {
      "lines": 80,
      "functions": 80
    }
  }
}