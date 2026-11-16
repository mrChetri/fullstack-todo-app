import { defineConfig } from 'vitest/config';

export default defineConfig({\n  test: {\n    globals: true,\n    environment: 'node',\n    setupFiles: ['./src/test/setup.ts'],\n    testTimeout: 20000,\n    hookTimeout: 20000,\n    fileParallelism: false,\n  },\n});
