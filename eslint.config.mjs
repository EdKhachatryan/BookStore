import simpleImportSort from 'eslint-plugin-simple-import-sort';
import changeDetectionStrategy from 'eslint-plugin-change-detection-strategy';
import unusedImports from 'eslint-plugin-unused-imports';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      'projects/**/*',
      'mocks/**/*',
      '**/package.json',
      '**/package-lock.json',
      'dist/**/*',
      'build/**/*',
      'openapi/**/*',
    ],
  },
  ...compat
    .extends(
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates',
      'plugin:prettier/recommended'
    )
    .map(config => ({
      ...config,
      files: ['**/*.ts'],
    })),
  {
    files: ['**/*.ts'],

    plugins: {
      'simple-import-sort': simpleImportSort,
      'change-detection-strategy': changeDetectionStrategy,
      'unused-imports': unusedImports,
      jest,
      prettier,
    },

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        project: ['tsconfig.json'],
        createDefaultProgram: true,
      },
    },

    rules: {
      'lines-between-class-members': 'off',

      'class-methods-use-this': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'no-param-reassign': [
        2,
        {
          props: false,
        },
      ],

      'max-len': [
        1,
        {
          code: 120,
          ignorePattern: '^import .* || ^export .*',
        },
      ],

      'import/prefer-default-export': 'off',

      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'mxs',
          style: 'camelCase',
        },
      ],

      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'mxs',
          style: 'kebab-case',
        },
      ],

      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'warn',
      'change-detection-strategy/on-push': 'error',
      'no-alert': 'error',
      'no-debugger': 'error',

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@ngneat/spectator',
              message: 'Please use @ngneat/spectator/jest instead.',
            },
            {
              name: '@angular/core/testing',
              importNames: ['TestBed'],
              message: 'Please use @ngneat/spectator/jest for testing instead.',
            },
            {
              name: 'assert',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'buffer',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'child_process',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'cluster',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'crypto',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'dgram',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'dns',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'domain',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'events',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'freelist',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'fs',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'http',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'https',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'module',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'net',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'os',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'path',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'punycode',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'querystring',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'readline',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'repl',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'smalloc',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'stream',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'string_decoder',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'sys',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'timers',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'tls',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'tracing',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'tty',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'url',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'util',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'vm',
              message: 'Node.js APIs are not available in the browser.',
            },
            {
              name: 'zlib',
              message: 'Node.js APIs are not available in the browser.',
            },
          ],
        },
      ],

      'no-underscore-dangle': ['off'],
    },
  },
  ...compat.extends('plugin:@angular-eslint/template/recommended').map(config => ({
    ...config,
    files: ['**/*.html'],
  })),
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'off',
    },
  },
  ...compat.extends('plugin:jest/recommended').map(config => ({
    ...config,
    files: ['**/*.spec.ts'],
  })),
];
