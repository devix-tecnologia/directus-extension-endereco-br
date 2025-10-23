import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    hookTimeout: 60000, // Define o timeout global para 30 segundos
  },
});