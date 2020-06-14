/* eslint-disable spaced-comment */

// load type definitions that come with Cypress module
/// <reference types="cypress" />

/** TypeScript declarations for commands added in `commands.js`. */

declare namespace Cypress {
  interface Chainable {

    /**
     * Select a DOM element by its `data-cy` attribute.
     *
     * @param value The value for the attribute.
     * @return The element(s) whose `data-cy` attribute matches `value`.
     */

    dataCy(value: string, options?: Partial<Loggable & Timeoutable & Withinable>):
      Chainable<Element>;

    /**
     * Loads emails sent to a given account. Emails sent in the Cypress environment are written to a
     * file and retrievable through a Cypress-specific API.
     *
     * @param email The email address.
     * @returns The raw email source of the latest email sent to that account.
     */

    emailsFor(email: string): Chainable<string>
  }
}
