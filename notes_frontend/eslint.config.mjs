/* eslint.config.mjs */
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      // Ignore Astro-generated types and build outputs
      '.astro/**',
      'dist/**',
      '.vercel/**',
      'node_modules/**',
    ],
  },

  js.configs.recommended,

  // TypeScript support
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Allow generated d.ts and virtual astro entries to pass
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/triple-slash-reference': ['off'],
      '@typescript-eslint/no-empty-object-type': ['off'],
    },
  },

  // JS files config
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      eqeqeq: ['error', 'always'],
    },
  },
];
