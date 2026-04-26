module.exports = {
  displayName: 'demo-vanilla',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/apps/demo-vanilla',
};
