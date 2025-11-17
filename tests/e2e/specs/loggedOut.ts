context('Logged out', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.request('/cypress/reset')
  })

  it('does not allow adding passes', () => {
    cy.visit('/#/squadrons/squadron-1')

    cy.dataCy('squadronBoardTitle').should('contain', 'Squadron 1 Greenie Board')
    cy.dataCy('addPassButton').should('not.exist')
    cy.dataCy('uploadButton').should('not.exist')
  })

  it('does not allow editing the squadron', () => {
    cy.visit('/#/squadrons/squadron-1')
    cy.dataCy('editSquadronLink').should('not.exist')
  })

  it('does not allow editing passes', () => {
    cy.visit('/#/squadrons/squadron-1')

    // Set date range to 2020 to show test data
    cy.nDateRange('2020-01-01', '2020-12-31')

    cy.get('[data-cy-pilot=Raamon]').dataCy('passCell').first().
      click()
    cy.dataCy('passForm').should('not.exist')
  })

  it('does not allow deleting passes', () => {
    cy.visit('/#/squadrons/squadron-1')

    cy.dataCy('deleteAllUnassigned').should('not.exist')
  })

  it('does not allow editing pilots', () => {
    cy.visit('/#/squadrons/squadron-1')

    // Set date range to 2020 to show test data
    cy.nDateRange('2020-01-01', '2020-12-31')

    cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').dataCy('passHeaderCell').find('a').
      click()
    cy.dataCy('renameButton').should('not.exist')
    cy.dataCy('mergeButton').should('not.exist')
    cy.dataCy('deletePilotButton').should('not.exist')
  })

  context('Forgot password', () => {
    it('handles unknown emails', () => {
      cy.visit('/#/')
      cy.dataCy('logInLink').click()
      cy.dataCy('forgotPasswordLink').click()

      cy.get('#squadron-email').type('unknown@example.com')
      cy.dataCy('forgotPasswordSubmit').click()
      cy.dataCy('squadron-email-group').should('contain', 'not found')
    })

    it('sends a forgot-password email', () => {
      cy.visit('/#/')
      cy.dataCy('logInLink').click()
      cy.dataCy('forgotPasswordLink').click()

      cy.get('#squadron-email').type('cypress@example.com')
      cy.dataCy('forgotPasswordSubmit').click()
      cy.dataCy('forgotPasswordSuccess').
        should('contain', 'Password reset email sent. Check your inbox!')
    })
  })

  context('Reset password', () => {
    beforeEach(() => {
      cy.visit('/#/')
      cy.dataCy('logInLink').click()
      cy.dataCy('forgotPasswordLink').click()
      cy.get('#squadron-email').type('cypress@example.com')
      cy.dataCy('forgotPasswordSubmit').click()
    })

    it('handles invalid tokens', () => {
      cy.visit('/#/reset_password/abc123')

      cy.get('#squadron-password input').type('password123')
      cy.get('#squadron-password_confirmation input').type('password123')
      cy.dataCy('resetPasswordSubmit').click()
      cy.get('.n-dialog').
        should('contain', 'The Reset Password link you used is invalid or expired.')
    })

    it('handles form errors', () => {
      cy.emailsFor('cypress@example.com').then(body => {
        const match = body.match(/<p><a href="http:\/\/localhost:5100(.+)">Change my password<\/a><\/p>/)
        const link = match![1]!
        cy.visit(link)

        cy.get('#squadron-password input').type('password123')
        cy.get('#squadron-password_confirmation input').type('password1234')
        cy.dataCy('resetPasswordSubmit').click()
        cy.dataCy('squadron-password_confirmation-group').
          should('not.be.empty').
          and('contain.text', 'match')
      })
    })
    it('resets a squadron password', () => {
      // Request a fresh password reset email for this test
      cy.visit('/#/')
      cy.dataCy('logInLink').click()
      cy.dataCy('forgotPasswordLink').click()
      cy.get('#squadron-email').type('cypress@example.com')
      cy.dataCy('forgotPasswordSubmit').click()

      cy.emailsFor('cypress@example.com').then((body: string) => {
        const match = body.match(/<p><a href="http:\/\/localhost:5100(.+)">Change my password<\/a><\/p>/)
        const link = match![1]!
        cy.visit(link)

        cy.get('#squadron-password input').type('password123', {force: true})
        cy.get('#squadron-password_confirmation input').type('password123', {force: true})
        cy.dataCy('resetPasswordSubmit').click()

        // Wait for and click any dialog button (success or error)
        cy.get('.n-dialog').should('exist')
        cy.get('.n-dialog .n-button').first().click()

        // Wait for navigation after dialog closes
        cy.location('hash').should('eql', '#/')
        cy.dataCy('logInLink').click()
        cy.get('#login-field input').should('be.visible').and('be.enabled')
        cy.get('#login-field input').type('squadron-1')
        cy.get('#password-field input').type('password123')
        cy.dataCy('loginSubmitButton').click()
        cy.location('hash').should('match', /^#\/squadrons\/squadron-1\/?$/)
      })
    })
  })
})
