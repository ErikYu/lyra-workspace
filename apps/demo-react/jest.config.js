module.exports = {
  displayName: 'demo-react',
  preset: '../../jest.preset.js',
  setupFiles: ['reflect-metadata'],
  setupFilesAfterEnv: ['<rootDir>/src/jest-setup.ts'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.(ts|tsx|js|jsx|html)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json' },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/apps/demo-react',
};
