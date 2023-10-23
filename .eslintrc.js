/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
  ],
  plugins: ['jest', 'import', 'license-header'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/newline-after-import': ['error', { count: 1 }],
    'import/order': [
      'warn',
      {
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'license-header/header': [
      'error',
      [
        '/*',
        ' * Copyright OpenSearch Contributors',
        ' * SPDX-License-Identifier: Apache-2.0',
        ' */',
      ],
    ],
  },
};
