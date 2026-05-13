import babelParser from '@babel/eslint-parser'
import reactPlugin from 'eslint-plugin-react'

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      semi: ['error', 'always'],
      'no-extra-semi': 'error',
    },
  },
]
