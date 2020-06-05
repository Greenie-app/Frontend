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
