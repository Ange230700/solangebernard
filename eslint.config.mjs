// @ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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
    },
  },
  eslintConfigPrettier,
);
