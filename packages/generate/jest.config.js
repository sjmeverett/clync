module.exports = {
  reporters: ['default', ['jest-junit', { outputDirectory: 'test-results' }]],
  testPathIgnorePatterns: ['dist', 'node_modules'],
};
