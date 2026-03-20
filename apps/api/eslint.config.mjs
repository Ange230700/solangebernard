// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const clientImportPatterns = [
  '@repo/api-client',
  '@repo/client',
  '@repo/client-core',
  '@repo/client-ui-web',
  '@angular/*',
  '@ionic/*',
  '@capacitor/*',
  '@tauri-apps/*',
  'primeng',
  'primeng/*',
];

const controllerPersistencePatterns = [
  '@prisma/client',
  'drizzle-orm',
  'drizzle-orm/*',
  'typeorm',
  'typeorm/*',
  '**/entities/**',
  '**/models/**',
  '**/persistence/**',
  '**/prisma/**',
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
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: clientImportPatterns,
              message:
                'apps/api must stay server-side. Do not import client packages or client UI frameworks into API code.',
            },
            {
              group: internalWorkspaceSubpathPatterns,
              message:
                'Use the stable package-root aliases from docs/path-aliases.md. Do not deep-import internal workspace files.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.controller.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: clientImportPatterns,
              message:
                'apps/api must stay server-side. Do not import client packages or client UI frameworks into API code.',
            },
            {
              group: internalWorkspaceSubpathPatterns,
              message:
                'Use the stable package-root aliases from docs/path-aliases.md. Do not deep-import internal workspace files.',
            },
            {
              group: controllerPersistencePatterns,
              message:
                'Controller files must map persistence models to contracts through services. Do not import ORM or persistence-model modules directly into controllers.',
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
