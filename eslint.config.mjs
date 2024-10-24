import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'
import tailwindcss from 'eslint-plugin-tailwindcss'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

const config = [
  // ...compat.extends('next/core-web-vitals', 'plugin:tailwindcss/recommended', 'prettier', 'plugin:prettier/recommended'),
  ...compat.extends('plugin:tailwindcss/recommended', 'prettier', 'plugin:prettier/recommended'),
  {
    ignores: ['.next/**/*', '.velite/**/*'],

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
      'sort-destructure-keys': sortDestructureKeys,
      tailwindcss
    },

    rules: {
      // '@next/next/no-html-link-for-pages': 'error',
      'no-console': 'off',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-key': 'off',
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          ignoreCase: true,
          noSortAlphabetically: false,
          reservedFirst: true,
          shorthandFirst: true,
          shorthandLast: false
        }
      ],
      'react/prop-types': 'off',
      'simple-import-sort/exports': 'error',
      'sort-destructure-keys/sort-destructure-keys': [
        2,
        {
          caseSensitive: false
        }
      ],
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/classnames-order': 'error'
    },

    settings: {
      tailwindcss: {
        callees: ['cn'],
        config: 'tailwind.config.ts'
      },

      next: {
        rootDir: true
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parser: tsParser
    }
  }
]

export default config
