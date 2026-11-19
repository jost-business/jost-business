/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';

// Canonical drive-letter case: on Windows a 'd:' vs 'D:' mismatch loads Angular twice
// and TestBed is never initialized when vitest is started with a lowercase path.
const root = realpathSync.native(import.meta.dirname);

export default defineConfig(() => ({
  resolve: {
    tsconfigPaths: true,
  },
  root,
  cacheDir: '../../node_modules/.vite/libs/shared',
  // This library is only run through Vitest (no Vite build), so point Analog at the spec
  // tsconfig; otherwise loading the config outside test mode looks for a missing tsconfig.app.json.
  plugins: [angular({ tsconfig: resolve(root, 'tsconfig.spec.json') })],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  test: {
    name: 'shared',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/shared',
      provider: 'v8' as const,
    },
  },
}));
