import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/gradient-lab/',
  build: { target: 'es2022' },
  test: { include: ['src/**/*.test.ts'] },
});
