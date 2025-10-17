// File: dotaislash-cli/vitest.config.ts
// What: Vitest configuration for CLI tests
// Why: Configure test runner with coverage and TypeScript support
// Related: package.json, tests/*

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.test.ts',
        'vitest.config.ts'
      ]
    }
  }
});
