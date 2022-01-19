module.exports = {
  preset: "ts-jest",
  rootDir: "./",
  clearMocks: true,
  collectCoverage: false,
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: [
    "<rootDir>/.*/build",
    "<rootDir>/.*/compiler-debug",
    "<rootDir>/_tmp"
  ],
  verbose: true,
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.jest.json"
    }
  },
}

