const resolve = require("path").resolve;

module.exports = {
    preset: './jest-preset.js',
    verbose: true,
    testEnvironment: 'jest-environment-puppeteer',
    globalSetup: "jest-environment-puppeteer/setup",
    globalTeardown: "jest-environment-puppeteer/teardown",
    collectCoverage: true,
    collectCoverageFrom: [
        "src/assets/js/**/*.{js,ts}"
    ]
};