module.exports = {
  plugins: ['chai-expect', 'chai-friendly', 'mocha'],
  env: {
    mocha: true
  },
  rules: {
    'mocha/no-hooks-for-single-case': 'off',
    'mocha/no-mocha-arrows': 'off',
    strict: 'off'
  },
  extends: [
    'plugin:chai-expect/recommended',
    'plugin:chai-friendly/recommended',
    'plugin:mocha/recommended'
  ],
  overrides: [
    {
      files: ['.ts', '.tsx'],
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  ]
}
