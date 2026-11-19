/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { realpathSync } from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  // Canonical drive-letter case: on Windows a 'd:' vs 'D:' mismatch loads Angular twice
  // and TestBed is never initialized when vitest is started with a lowercase path.
  root: realpathSync.native(import.meta.dirname),
  cacheDir: '../../../node_modules/.vite/libs/ui/countdown',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  test: {
    name: 'ui-countdown',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/ui/countdown',
      provider: 'v8' as const,
    },
  },
}));
