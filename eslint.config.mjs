import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          // Every project has a type (what layer it is) and a scope (which
          // domain it belongs to). An import must satisfy every matching rule.
          depConstraints: [
            // Layers: deployables on top, plain types at the bottom
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:feature', 'type:core', 'type:ui', 'type:util'],
            },
            {
              sourceTag: 'type:element',
              onlyDependOnLibsWithTags: ['type:feature', 'type:core', 'type:ui', 'type:util'],
            },
            // Features never import each other; the app composes them
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:core', 'type:ui', 'type:util'],
            },
            // shared: state, services and app-wide components
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            { sourceTag: 'type:assets', onlyDependOnLibsWithTags: [] },
            // End-to-end tests drive the running app; they may share its types, not its code
            { sourceTag: 'type:e2e', onlyDependOnLibsWithTags: ['type:util'] },

            // Domains: each may use its own code and the shared code
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
            { sourceTag: 'scope:travel', onlyDependOnLibsWithTags: ['scope:travel', 'scope:shared'] },
            { sourceTag: 'scope:finance', onlyDependOnLibsWithTags: ['scope:finance', 'scope:shared'] },
            { sourceTag: 'scope:about-me', onlyDependOnLibsWithTags: ['scope:about-me', 'scope:shared'] },
            { sourceTag: 'scope:playground', onlyDependOnLibsWithTags: ['scope:playground', 'scope:shared'] },
            { sourceTag: 'scope:pwa', onlyDependOnLibsWithTags: ['scope:pwa', 'scope:shared'] },
            { sourceTag: 'scope:shell', onlyDependOnLibsWithTags: ['scope:shell', 'scope:shared'] },
            // The Node API must not pull in Angular code: plain types only
            { sourceTag: 'scope:api', onlyDependOnLibsWithTags: ['type:util'] },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
