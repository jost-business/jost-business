/// <reference types='vitest' />
import { defineConfig, normalizePath } from 'vite';
import { resolve } from 'node:path';
import { realpathSync } from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// Canonical drive-letter case: on Windows a 'd:' vs 'D:' mismatch loads Angular twice
// and TestBed is never initialized when vitest is started with a lowercase path.
const root = realpathSync.native(import.meta.dirname);

// On Windows nxViteTsPaths resolves aliases to backslash paths that the Analog compiler
// does not match, so those modules come out empty. Resolve the libs we use with normalized paths.
const lib = (path: string) => normalizePath(resolve(root, '../../libs', path));

export default defineConfig(() => ({
  root,
  cacheDir: '../../node_modules/.vite/apps/pwa-countdown',
  plugins: [angular(), nxViteTsPaths()],
  resolve: {
    alias: [
      { find: /^@jost\/shared$/, replacement: lib('shared/src/index.ts') },
      { find: /^ui-countdown$/, replacement: lib('ui/countdown/src/index.ts') },
    ],
  },
  test: {
    name: 'pwa-countdown',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/pwa-countdown',
      provider: 'v8' as const,
    },
  },
}));
