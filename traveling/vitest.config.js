import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['billing.js'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
