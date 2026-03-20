// @ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const frameworkImportPatterns = [
  '@angular/*',
  '@nestjs/*',
  '@ionic/*',
  '@capacitor/*',
  '@tauri-apps/*',
  'primeng',
  'primeng/*',
];

const ormImportPatterns = [
  '@prisma/client',
  'drizzle-orm',
  'drizzle-orm/*',
  'typeorm',
  'typeorm/*',
];

const internalWorkspaceSubpathPatterns = [
  '@repo/contracts/*',
  '@repo/domain/*',
  '@repo/api-client/*',
  '@repo/client-core/*',
  '@repo/client-ui-web/*',
];

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.angular/**',
      'apps/**',
      '!apps/client/eslint.config.js',
      'apps/client/projects/**',
      '!apps/client/projects/**/eslint.config.js',
      'apps/client/android/**',
      'apps/client/src-tauri/**',
    ],
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...eslint.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
    },
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['packages/**/*.ts'],
  })),
  {
    files: ['packages/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: internalWorkspaceSubpathPatterns,
              message:
                'Use stable package-root aliases for internal workspaces. Do not deep-import another workspace internals.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                ...frameworkImportPatterns,
                '@repo/api',
                '@repo/api-client',
                '@repo/client',
                '@repo/client-core',
                '@repo/client-ui-web',
              ],
              message:
                'packages/domain must stay framework-free. Keep app, client, and framework imports out of domain code.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/contracts/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                ...frameworkImportPatterns,
                ...ormImportPatterns,
                '@repo/api',
                '@repo/api-client',
                '@repo/client',
                '@repo/client-core',
                '@repo/client-ui-web',
                '@repo/domain',
              ],
              message:
                'packages/contracts must stay transport-safe. Keep framework, domain, app, client, and ORM imports out of shared contracts.',
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
