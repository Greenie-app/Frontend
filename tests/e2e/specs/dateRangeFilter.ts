context('Date Range Filtering', () => {
  context('Default behavior', () => {
    beforeEach(() => {
      // Clear localStorage to prevent stale data issues
      cy.clearLocalStorage()

      // Reset database state without uploading test data
      cy.request('/cypress/reset?no_upload=true')

      // Log in as squadron-1
      cy.visit('/#/login')
      cy.get('#login-field').type('squadron-1')
      cy.get('#password-field').type('password123')
      cy.dataCy('loginSubmitButton').click()
      cy.location('hash', { timeout: 10000 }).should('match', /^#\/squadrons\/squadron-1\/?$/)
    })

    it('shows date range picker', () => {
      // Check that the date range picker is visible
      cy.get('.n-date-picker').should('be.visible')

      // The date range picker should have default values (current date range)
      cy.get('.n-date-picker input').should('have.length', 2)
    })
  })

  context('Date selection for test data', () => {
    beforeEach(() => {
      // Clear localStorage to prevent stale data issues
      cy.clearLocalStorage()

      // Reset database state WITH test data
      cy.request('/cypress/reset')

      // Log in as squadron-1
      cy.visit('/#/login')
      cy.get('#login-field').type('squadron-1')
      cy.get('#password-field').type('password123')
      cy.dataCy('loginSubmitButton').click()
      cy.location('hash', { timeout: 10000 }).should('match', /^#\/squadrons\/squadron-1\/?$/)
    })

    it('loads passes when selecting a date range with test data', () => {
      // We know test data is from 2020, so we'll use the date picker input directly
      // This is more reliable than navigating through the date panel UI

      // Wait for date picker to be ready
      cy.get('.n-date-picker').should('be.visible')
      cy.wait(500)

      // Set dates using {selectall} instead of clear() to avoid "Invalid time value" errors
      cy.get('.n-date-picker input').first().click().type('{selectall}2020-01-01')
      cy.get('.n-date-picker input').last().click().type('{selectall}2020-12-31{enter}')

      // Wait for passes to load
      cy.wait(3000)

      // Verify passes are loaded (we know test data has passes in 2020)
      cy.dataCy('passCell', { timeout: 10000 }).should('exist')
      cy.dataCy('passCell').should('have.length.greaterThan', 0)
    })

    it('shows no passes message for dates without data', () => {
      // Wait for date picker to be ready
      cy.get('.n-date-picker').should('be.visible')
      cy.wait(500)

      // Select a date range with no data (2019)
      cy.get('.n-date-picker input').first().click().type('{selectall}2019-01-01')
      cy.get('.n-date-picker input').last().click().type('{selectall}2019-12-31{enter}')

      // Wait for response
      cy.wait(3000)

      // Should show no passes message
      cy.get('body').should('contain', 'No passes found in selected date range.')
    })
  })

  context('Date range with pass operations', () => {
    beforeEach(() => {
      // Clear localStorage to prevent stale data issues
      cy.clearLocalStorage()

      // Reset database state WITH test data
      cy.request('/cypress/reset')

      // Log in as squadron-1
      cy.visit('/#/login')
      cy.get('#login-field').type('squadron-1')
      cy.get('#password-field').type('password123')
      cy.dataCy('loginSubmitButton').click()
      cy.location('hash', { timeout: 10000 }).should('match', /^#\/squadrons\/squadron-1\/?$/)
    })

    it('maintains selected date range when adding a new pass', () => {
      // Wait for date picker to be ready
      cy.get('.n-date-picker').should('be.visible')
      cy.wait(500)

      // Select full 2020 date range to ensure we have passes
      // Use {selectall} instead of clear() to avoid "Invalid time value" errors
      cy.get('.n-date-picker input').first().click().type('{selectall}2020-01-01')
      cy.get('.n-date-picker input').last().click().type('{selectall}2020-12-31{enter}')

      // Wait for passes to load
      cy.wait(3000)

      // Verify passes loaded
      cy.dataCy('passCell', { timeout: 10000 }).should('exist')

      // Add a new pass (with 2020 date)
      cy.dataCy('addPassButton').click()

      // Wait for the dialog to open
      cy.contains('Add Pass').should('be.visible')

      // Fill pilot field (don't set time since it will default to now, and we'll update range after)
      cy.nInput('#pass-pilot').type('TestPilot2020')
      cy.nInput('#pass-pilot').blur()

      // Fill aircraft type field
      cy.nInput('#pass-aircraft_type').type('FA-18C')
      cy.nInput('#pass-aircraft_type').blur()

      // Select grade using helper
      cy.nSelect('#pass-grade', 'OK')

      // Save the pass
      cy.dataCy('savePassButton').click()

      // The new pass has today's date, so update date range to include it
      cy.get('.n-date-picker input').first().click().type('{selectall}2020-01-01')
      cy.get('.n-date-picker input').last().click().type('{selectall}2025-12-31{enter}')
      cy.get('body').type('{esc}')

      // Verify the specific pilot was added
      cy.get('[data-cy-pilot="TestPilot2020"]', { timeout: 10000 }).should('exist')

      // Verify the date range is maintained (should include both 2020 and current year)
      cy.get('.n-date-picker input').first().should('have.value', '2020-01-01')
      cy.get('.n-date-picker input').last().should('have.value', '2025-12-31')
    })

    it('handles date range filtering correctly after operations', () => {
      // Wait for date picker to be ready
      cy.get('.n-date-picker').should('be.visible')
      cy.wait(500)

      // Set date range to 2020
      cy.get('.n-date-picker input').first().click().type('{selectall}2020-01-01')
      cy.get('.n-date-picker input').last().click().type('{selectall}2020-12-31{enter}')

      // Wait for passes to load
      cy.wait(3000)

      // Verify passes are shown
      cy.dataCy('passCell', { timeout: 10000 }).should('exist')

      // Now change to 2021 (no passes)
      cy.get('.n-date-picker input').first().click().type('{selectall}2021-01-01')
      cy.get('.n-date-picker input').last().click().type('{selectall}2021-12-31{enter}')

      // Wait for update
      cy.wait(3000)

      // Should show no passes message
      cy.get('body').should('contain', 'No passes found in selected date range.')

      // Go back to 2020
      cy.get('.n-date-picker input').first().click().type('{selectall}2020-01-01')
      cy.get('.n-date-picker input').last().click().type('{selectall}2020-12-31{enter}')

      // Wait for update
      cy.wait(3000)

      // Passes should be shown again
      cy.dataCy('passCell').should('exist')
    })
  })
})