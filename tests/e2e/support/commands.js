// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import 'cypress-file-upload'

Cypress.Commands.add(
  'dataCy',
  { prevSubject: 'optional' },
  (subject, value, options) => {
    if (subject) {
      return cy.wrap(subject).find(`[data-cy=${value}]`, options)
    }
    return cy.get(`[data-cy=${value}]`, options)
  }
)

Cypress.Commands.add('emailsFor', email => cy.request(`/cypress/emails?email=${encodeURIComponent(email)}`).its('body'))

// Naive UI custom commands for Vue 3

/**
 * Select an option from a Naive UI n-select component
 * @param {string} selector - The selector for the n-select component (e.g., '#pass-grade')
 * @param {string} value - The value to select
 */
Cypress.Commands.add('nSelect', (selector, value) => {
  cy.get(selector).click()
  cy.get('.n-base-select-option').contains(value).click()
})

/**
 * Type text into a Naive UI n-input component inside an n-select
 * Useful for autocomplete/searchable selects
 * @param {string} selector - The selector for the n-select component
 * @param {string} text - The text to type
 */
Cypress.Commands.add('nSelectType', (selector, text) => {
  cy.get(selector).click()
  // Wait for the dropdown menu to appear, then find the input
  cy.get('.n-base-select-menu', { timeout: 5000 }).should('be.visible')
  cy.get('.n-base-select-menu .n-base-select-option__content input, .n-base-selection-input input').type(text)
  cy.get('.n-base-select-option').contains(text).click()
})

/**
 * Get the input element inside a Naive UI component
 * Useful for password fields and other n-input components
 * @param {string} selector - The selector for the n-form-item or container
 */
Cypress.Commands.add('nInput', { prevSubject: 'optional' }, (subject, selector) => {
  if (subject) {
    return cy.wrap(subject).find(selector).should('exist').find('input')
  }
  return cy.get(selector, { timeout: 5000 }).should('exist').find('input')
})
