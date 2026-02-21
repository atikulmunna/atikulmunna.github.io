module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.property.test.js'
  ],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
