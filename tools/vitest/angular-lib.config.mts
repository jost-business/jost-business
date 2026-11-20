import { defineConfig, type ViteUserConfig } from 'vitest/config';
import { readFileSync, realpathSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import angular from '@analogjs/vite-plugin-angular';
import { playwright } from '@vitest/browser-playwright';

const workspaceRoot = resolve(import.meta.dirname, '../..');

/**
 * Vitest setup for an Angular library without a build target. Apps use
 * Angular's own @angular/build:unit-test builder, which needs a build target;
 * libraries compile through Analog's Vite plugin instead.
 *
 * Tests run in headless Chromium (Vitest browser mode), so layout,
 * IntersectionObserver and real events behave as they do for users.
 */
export function angularLibTestConfig(projectDir: string): ViteUserConfig {
  // Canonical drive-letter case: on Windows a 'd:' vs 'D:' mismatch loads Angular twice
  // and TestBed is never initialized when vitest is started with a lowercase path.
  const root = realpathSync.native(projectDir);
  const fromWorkspace = relative(workspaceRoot, root);
  const { name } = JSON.parse(readFileSync(join(root, 'project.json'), 'utf8')) as { name: string };

  return defineConfig({
    root,
    cacheDir: join(workspaceRoot, 'node_modules/.vite', fromWorkspace),
    resolve: { tsconfigPaths: true },
    // There is no Vite build for a library, so Analog compiles with the spec tsconfig
    plugins: [angular({ tsconfig: join(root, 'tsconfig.spec.json') })],
    test: {
      name,
      watch: false,
      globals: true,
      include: ['src/**/*.spec.ts'],
      setupFiles: ['src/test-setup.ts'],
      reporters: ['default'],
      browser: {
        enabled: true,
        provider: playwright(),
        headless: true,
        instances: [{ browser: 'chromium' }],
      },
      coverage: {
        provider: 'v8',
        reportsDirectory: join(workspaceRoot, 'coverage', fromWorkspace),
      },
    },
  });
}
