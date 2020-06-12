module.exports = {
  plugins: [
    'cypress'
  ],
  env: {
    'cypress/globals': true
  },
  extends: [
    'plugin:cypress/recommended'
  ],
  rules: {
    strict: 'off',
    'spaced-comment': 'off'
  }
}
