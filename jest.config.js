module.exports = {
  preset: './jest-preset.js',
  testEnvironment: 'jest-environment-puppeteer',
  globalSetup: "jest-environment-puppeteer/setup",
  globalTeardown: "jest-environment-puppeteer/teardown"
};