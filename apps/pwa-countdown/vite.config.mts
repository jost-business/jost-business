/// <reference types='vitest' />
import { defineConfig, normalizePath } from 'vite';
import { resolve } from 'node:path';
import { realpathSync } from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin';

// Canonical drive-letter case: on Windows a 'd:' vs 'D:' mismatch loads Angular twice
// and TestBed is never initialized when vitest is started with a lowercase path.
const root = realpathSync.native(import.meta.dirname);

// Resolve the workspace libs we use explicitly with normalized paths: resolve.tsconfigPaths
// does not find them here, and backslash paths on Windows make the Analog compiler emit empty modules.
const lib = (path: string) => normalizePath(resolve(root, '../../libs', path));

export default defineConfig(() => ({
  root,
  cacheDir: '../../node_modules/.vite/apps/pwa-countdown',
  plugins: [angular(), nxReadySignal()],
  resolve: {
    tsconfigPaths: true,
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
