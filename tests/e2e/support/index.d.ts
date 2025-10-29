 

// load type definitions that come with Cypress module
/// <reference types="cypress" />
/// <reference types="cypress-file-upload" />

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

    /**
     * Select an option from a Naive UI n-select component.
     *
     * @param selector The selector for the n-select component (e.g., '#pass-grade').
     * @param value The value to select.
     * @returns The chainable for further commands.
     */

    nSelect(selector: string, value: string): Chainable<Element>

    /**
     * Type text into a Naive UI n-input component inside an n-select.
     * Useful for autocomplete/searchable selects.
     *
     * @param selector The selector for the n-select component.
     * @param text The text to type.
     * @returns The chainable for further commands.
     */

    nSelectType(selector: string, text: string): Chainable<Element>

    /**
     * Get the input element inside a Naive UI component.
     * Useful for password fields and other n-input components.
     *
     * @param selector The selector for the n-form-item or container.
     * @returns The input element.
     */

    nInput(selector: string): Chainable<Element>
  }
}
