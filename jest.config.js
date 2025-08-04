// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testMatch: ['<rootDir>/**/*.test.{js,jsx,ts,tsx}', '<rootDir>/**/*.spec.{js,jsx,ts,tsx}'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Исправленные пути для игнорирования
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/shared/utils/remarkMermaid.ts',
    '<rootDir>/shared/utils/remarkMath.js',
  ],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: ['next/babel', ['@babel/preset-typescript', { allowDeclareFields: true }]],
        plugins: [['@babel/plugin-transform-modules-commonjs', { strictMode: false }]],
      },
    ],
  },

  // Укажите, что нужно обрабатывать как ESM
  extensionsToTreatAsEsm: ['.ts'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      useESM: true,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mts'],
  resetMocks: true,

  // Добавьте это для обработки ESM-модулей
  transformIgnorePatterns: ['node_modules/(?!(micromark-extension-math|mdast-util-math)/)'],
};

module.exports = createJestConfig(customJestConfig);
