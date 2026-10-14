import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist: build generado. supabase/functions: código Deno (TypeScript), fuera del alcance de este linter.
  globalIgnores(['dist', 'supabase']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat['recommended-latest'], reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Las variables en MAYÚSCULAS sin usar suelen ser constantes de configuración en uso futuro.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Regla del proyecto (CLAUDE.md): nada de var.
      'no-var': 'error',
      'prefer-const': 'error',
      // Regla del proyecto: sin alert/confirm/prompt, todo el feedback va en el DOM.
      'no-alert': 'error',
      // Regla del proyecto: sin innerHTML.
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Usa createElement/appendChild o JSX (regla del proyecto).' },
      ],
    },
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
])
