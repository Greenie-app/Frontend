 

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

    /**
     * Fill a Naive UI date range picker with start and end dates.
     *
     * @param startDate The start date in YYYY-MM-DD format.
     * @param endDate The end date in YYYY-MM-DD format.
     * @param options Optional configuration.
     * @returns The chainable for further commands.
     */

    nDateRange(startDate: string, endDate: string, options?: {
      selector?: string
      waitBefore?: number
      waitAfter?: number
      closePanel?: boolean
    }): Chainable<void>

    /**
     * Click a button in a Naive UI dialog.
     *
     * @param buttonType The button type: 'error', 'warning', 'primary', 'info', or 'default'.
     * @param buttonText Optional text to match on the button.
     * @returns The chainable for further commands.
     */

    nDialogConfirm(buttonType?: string, buttonText?: string): Chainable<Element>

    /**
     * Dismiss/close a Naive UI dialog by clicking the first button (typically Cancel).
     *
     * @returns The chainable for further commands.
     */

    nDialogDismiss(): Chainable<Element>

    /**
     * Select an option from a Naive UI dropdown menu.
     *
     * @param optionText The text of the option to select.
     * @returns The chainable for further commands.
     */

    nDropdownOption(optionText: string): Chainable<Element>

    /**
     * Close a Naive UI card by clicking its close button.
     *
     * @param selector Optional selector for the card.
     * @returns The chainable for further commands.
     */

    nCardClose(selector?: string): Chainable<Element>
  }
}
