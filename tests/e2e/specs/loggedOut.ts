context('Logged out', () => {
  beforeEach(() => cy.request('/cypress/reset'))

  it('does not allow adding passes', () => {
    cy.visit('/#/squadrons/squadron-1/')

    cy.dataCy('squadronBoardTitle').should('contain', 'Squadron 1 Greenie Board')
    cy.dataCy('addPassButton').should('not.exist')
    cy.dataCy('uploadButton').should('not.exist')
  })

  it('does not allow editing the squadron', () => {
    cy.visit('/#/squadrons/squadron-1/')
    cy.dataCy('editSquadronLink').should('not.exist')
  })

  it('does not allow editing passes', () => {
    cy.visit('/#/squadrons/squadron-1/')

    cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Raamon]').dataCy('passCell').first().
      click()
    cy.dataCy('passForm').should('not.exist')
  })

  it('does not allow deleting passes', () => {
    cy.visit('/#/squadrons/squadron-1/')

    cy.dataCy('deleteAllUnassigned').should('not.exist')
  })

  it('does not allow editing pilots', () => {
    cy.visit('/#/squadrons/squadron-1/')

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
      cy.dataCy('squadron-email-group').get('.invalid-feedback').should('contain', 'not found')
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

      cy.get('#squadron-password').type('password123')
      cy.get('#squadron-password_confirmation').type('password123')
      cy.dataCy('resetPasswordSubmit').click()
      cy.get('.modal-dialog .modal-content').
        should('contain', 'The Reset Password link you used is invalid or expired.')
    })

    it('handles form errors', () => {
      cy.emailsFor('cypress@example.com').then(body => {
        const link = body.match(/<p><a href="http:\/\/localhost:5100(.+)">Change my password<\/a><\/p>/)![1]
        cy.visit(link)

        cy.get('#squadron-password').type('password123')
        cy.get('#squadron-password_confirmation').type('password1234')
        cy.dataCy('resetPasswordSubmit').click()
        cy.dataCy('squadron-password_confirmation-group').get('.invalid-feedback').
          should('contain', 'doesn’t match password')
      })
    })
    it('resets a squadron password', () => {
      cy.emailsFor('cypress@example.com').then((body: string) => {
        const link = body.match(/<p><a href="http:\/\/localhost:5100(.+)">Change my password<\/a><\/p>/)![1]
        cy.visit(link)

        cy.get('#squadron-password').type('password123')
        cy.get('#squadron-password_confirmation').type('password123')
        cy.dataCy('resetPasswordSubmit').click()
        cy.get('.modal-footer .btn-primary').click()

        cy.dataCy('logInLink').click()
        cy.get('#login-field').should('be.enabled')
        cy.get('#login-field').type('squadron-1')
        cy.get('#password-field').type('password123')
        cy.dataCy('loginSubmitButton').click()
        cy.location('hash').should('eql', '#/squadrons/squadron-1/')
      })
    })
  })
})
