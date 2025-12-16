/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      dataCy(value: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>
      emailsFor(email: string): Chainable<Response<unknown>>
      nSelect(selector: string, value: string): Chainable<void>
      nSelectType(selector: string, text: string): Chainable<void>
      nInput(selector: string): Chainable<JQuery<HTMLElement>>
      nDateRange(startDate: string, endDate: string, options?: { selector?: string; closePanel?: boolean }): Chainable<void>
      nDialogConfirm(buttonType?: string, buttonText?: string): Chainable<void>
      nDialogDismiss(): Chainable<void>
      nDropdownOption(optionText: string): Chainable<void>
      nCardClose(selector?: string): Chainable<void>
    }
  }
}

export {}
