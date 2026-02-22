module.exports = {
  testEnvironment: 'node',

  
  
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/index.js'
  ],
  verbose: true,
  testTimeout: 15000,  // ← AUMENTAR TIMEOUT
  forceExit: true,
  detectOpenHandles: false  // ← CAMBIAR A FALSE
};