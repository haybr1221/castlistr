import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Pages set loading flags at the top of their fetch effects. React discourages
      // that, but it works; fixing it means a data-fetching rewrite (Suspense or a
      // query library), not a lint chore. Kept visible as warnings so they are not
      // forgotten. Raise back to 'error' when the pages are reworked.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Test files use Vitest's globals (describe, it, expect, vi, ...)
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.vitest },
    },
  },
])
