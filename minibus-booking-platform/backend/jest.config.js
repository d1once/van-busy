// minibus-booking-platform/backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/jest.setup.js'], // Path to your setup file
  testPathIgnorePatterns: ['/node_modules/', '/frontend/'], // Ignore frontend tests if any are in this project
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '**/*.js',
    '!jest.config.js',
    '!jest.setup.js',
    '!/coverage/**',
    '!/node_modules/**',
    '!/tests/**', // Usually, you don't collect coverage from test files themselves
    // Add other files/directories to ignore if needed
  ],
};
