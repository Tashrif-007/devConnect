module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
    collectCoverageFrom: [
        'src/controllers/*.ts',
        'src/services/*.ts',
        'src/middlewares/authentication.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        'src/config',
        'src/templates',
    ],
    coverageThreshold: {
        './src/services/**/*.ts': {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
        './src/controllers/**/*.ts': {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
        './src/middlewares/authentication.ts': {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};
