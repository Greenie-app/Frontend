// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Ignore benign ResizeObserver errors
Cypress.on('uncaught:exception', (err) => {
  // ResizeObserver errors are benign and can be ignored
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false
  }
  // Let other errors fail the test
  return true
})
