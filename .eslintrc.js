module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ['vuejs-accessibility'],
  extends: [
    '@vue/airbnb',
    '@vue/typescript/recommended',
    'plugin:vue/essential',
    'plugin:vuejs-accessibility/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: false
    }
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'dot-location': ['error', 'object'],
    'implicit-arrow-linebreak': 'off',
    'import/extensions': 'off',
    'import/no-named-default': 'off',
    'import/order': ['error', { groups: ['builtin', 'external', 'parent', 'sibling', 'index'] }],
    'max-classes-per-file': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-plusplus': 'off',
    'no-shadow': 'off',
    'no-undef': 'off',
    'no-useless-constructor': 'off',
    'vue/script-indent': ['error', 2, { baseIndent: 1 }],
    'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
    'vuejs-accessibility/no-static-element-interactions': 'off',
    semi: ['error', 'never']
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off'
      }
    },
    {
      files: ['.ts', '.tsx'],
      rules: {
        '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'angle-bracket' }],
        '@typescript-eslint/no-loss-of-precision': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      },
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  ],
  settings: {
    'import/resolver': {
      typescript: {}
    }
  }
}
