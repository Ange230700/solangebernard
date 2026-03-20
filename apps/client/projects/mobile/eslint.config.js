// @ts-check
const { defineConfig } = require('eslint/config');
const rootConfig = require('../../eslint.config.js');

module.exports = defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@repo/client-ui-web',
              message:
                'projects/mobile must not depend on @repo/client-ui-web. Use @repo/client-core or mobile-specific UI instead.',
            },
          ],
          patterns: [
            {
              group: ['@repo/client-ui-web/*', '**/ui-web/**'],
              message:
                'projects/mobile must not import from projects/ui-web. Use @repo/client-core or mobile-specific UI instead.',
            },
          ],
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
]);
