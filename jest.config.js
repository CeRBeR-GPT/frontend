// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Указываем путь к Next.js приложению
  dir: './',
});

// Кастомная конфигурация Jest
const customJestConfig = {
  // Директории с тестами
  testMatch: ['<rootDir>/**/*.test.{js,jsx,ts,tsx}', '<rootDir>/**/*.spec.{js,jsx,ts,tsx}'],

  // Настройки модулей
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    // Для поддержки алиасов, как в tsconfig.json
    '^@/(.*)$': '<rootDir>/$1',

    // Обработка CSS и других файлов
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },

  // Настройки тестовой среды
  testEnvironment: 'jest-environment-jsdom',

  // Глобальные настройки
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Игнорируемые директории
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  // Трансформации
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },

  // Расширения файлов
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Сброс моков перед каждым тестом
  resetMocks: true,
};

// Экспортируем конфигурацию
module.exports = createJestConfig(customJestConfig);
