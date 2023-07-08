context('Sign up', () => {
  it('handles form errors', () => {
    cy.visit('/#/')

    cy.dataCy('signUpButton').click()
    cy.get('#squadron-name').type('Squadron 2')
    cy.get('#squadron-username').should('have.value', 'squadron-2')
    cy.get('#squadron-email').type('cypress2@example.com')
    cy.get('#squadron-password').type('password123')
    cy.get('#squadron-password_confirmation').type('notthesame')

    cy.fixture('image.png', 'base64').then(data => {
      cy.get('#squadron-image').attachFile(
        {
          fileContent: data,
          filePath: 'image.png',
          encoding: 'base64',
          mimeType: 'image/png'
        },
        { subjectType: 'input' }
      )

      cy.dataCy('signUpSubmit').click()
      cy.dataCy('squadron-password_confirmation-group').
        get('.invalid-feedback').
        should('contain', 'doesn’t match password')
    })
  })

  it('signs up a new squadron', () => {
    cy.visit('/#/')

    cy.dataCy('signUpButton').click()
    cy.get('#squadron-name').type('Squadron 2')
    cy.get('#squadron-username').should('have.value', 'squadron-2')
    cy.get('#squadron-email').type('cypress2@example.com')
    cy.get('#squadron-password').type('password123')
    cy.get('#squadron-password_confirmation').type('password123')

    cy.fixture('image.png', 'base64').then(data => {
      cy.get('#squadron-image').attachFile(
        {
          fileContent: data,
          filePath: 'image.png',
          encoding: 'base64',
          mimeType: 'image/png'
        },
        { subjectType: 'input' }
      )

      cy.dataCy('signUpSubmit').click()

      cy.location('hash').should('eql', '#/squadrons/squadron-2/')
      cy.dataCy('squadronBoardingRate').should('not.exist')
    })
  })
})

context('Logged in without passes', () => {
  beforeEach(() => {
    cy.request('/cypress/reset?no_upload=true')

    cy.visit('/#/login')
    cy.get('#login-field').type('squadron-1')
    cy.get('#password-field').type('password123')
    cy.dataCy('loginSubmitButton').click()
  })

  it('does not upload invalid files', () => {
    cy.dataCy('uploadButton').click()
    cy.fixture('image.png', 'base64').then(data => {
      cy.get('#logfile-files').attachFile(
        {
          fileContent: data,
          filePath: 'image.png',
          encoding: 'base64',
          mimeType: 'image/png'
        },
        { subjectType: 'input' }
      )

      cy.dataCy('uploadSubmit').click()
      cy.dataCy('logfile-files-group').
        get('.invalid-feedback').
        should('contain', 'has an invalid content type')
    })
  })

  it('uploads a dcs.log file', () => {
    cy.dataCy('uploadButton').click()

    cy.fixture('dcs.log', 'base64').then(data => {
      cy.get('#logfile-files').attachFile(
        {
          fileContent: data,
          filePath: 'dcs.log',
          encoding: 'base64',
          mimeType: 'text/x-log'
        },
        { subjectType: 'input' }
      )

      cy.dataCy('uploadSubmit').click()
      // cy.dataCy('uploadStatus').should('contain', 'In Progress')

      cy.get('button.close').click()

      cy.dataCy('passCell', { timeout: 20000 }).should('have.length', 12)
      // cy.dataCy('squadronBoardingRate').should('contain.text', 'Boarding rate: 0.38')
    })
  })
})

context('Logged in with passes', () => {
  beforeEach(() => {
    cy.request('/cypress/reset')

    cy.visit('/#/login')
    cy.get('#login-field').type('squadron-1')
    cy.get('#password-field').type('password123')
    cy.dataCy('loginSubmitButton').click()
  })

  context('Adding passes', () => {
    it('adds a pass manually', () => {
      cy.dataCy('addPassButton').click()
      cy.get('#pass-pilot').type('Jambo72nd')
      cy.get('#pass-aircraft_type').type('F-14B')
      cy.get('#pass-grade').select('perfect')
      cy.get('#pass-score').should('have.value', '5.0')
      cy.get('#pass-wire').should('have.value', '3')
      cy.get('#pass-trap').should('have.value', 'true')

      cy.dataCy('savePassButton').click()

      cy.dataCy('passHeaderCell').first().invoke('text').should('include', 'Jambo72nd  (2.5)')

      cy.dataCy('passCell').eq(1).dataCy('passCellScore').should('contain', '5.0')
      cy.dataCy('passCell').eq(1).dataCy('passCellGrade').should('contain.text', 'OK-3')

      cy.dataCy('addPassButton').click()
      cy.get('#pass-pilot').should('have.value', 'Jambo72nd')
      cy.get('#pass-aircraft_type').should('have.value', 'F-14B')
      cy.get('#pass-score').should('have.value', '')
      cy.get('#pass-wire').should('not.exist')
      cy.get('#pass-trap').should('have.value', '')

      cy.get('button.close').click()
      cy.dataCy('squadronBoardingRate').should('contain.text', 'Boarding rate: 1.00')
    })
  })

  context('Viewing and editing pilots', () => {
    it('shows the pilot board', () => {
      cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
        dataCy('passHeaderCell').
        find('a').
        click()

      cy.location('hash').should('eql', '#/squadrons/squadron-1/pilots/Jambo72nd')
    })

    context('Editing pilots', () => {
      it('handles rename form errors', () => {
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
          dataCy('passHeaderCell').
          find('a').
          click()
        cy.dataCy('renameButton').click()

        cy.get('#pilot-name').type(' ')
        cy.dataCy('renameSubmit').click()
        cy.dataCy('pilot-name-group').get('.invalid-feedback').should('contain', 'can’t be blank')
      })

      it('renames a pilot', () => {
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
          dataCy('passHeaderCell').
          find('a').
          click()
        cy.dataCy('renameButton').click()

        cy.get('#pilot-name').type('Jambo')
        cy.dataCy('renameSubmit').click()
        cy.location('hash').should('eql', '#/squadrons/squadron-1/pilots/Jambo')
        cy.dataCy('pilotBoardTitle').should('not.contain', 'Jambo72nd')
      })

      it('merges two pilots', () => {
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Stretch\\|55FS]').
          dataCy('passHeaderCell').
          find('a').
          click()

        cy.dataCy('mergeButton').click()
        cy.dataCy('mergeButton').find('ul>li>a').contains('Jambo72nd').click()
        cy.dataCy('mergeConfirmButton').click()
        cy.location('hash').should('eql', '#/squadrons/squadron-1/')

        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
          dataCy('passHeaderCell').
          invoke('text').
          should('include', 'Jambo72nd  (0.7)')
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
          dataCy('passHeaderCell').
          find('a').
          click()
        cy.dataCy('pilotBoardTable').find('tr').should('have.length', 4)
      })

      it('deletes a pilot', () => {
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Raamon]').
          dataCy('passHeaderCell').
          find('a').
          click()

        cy.dataCy('deletePilotButton').click()
        cy.get('.modal-dialog .btn-danger').click()

        cy.location('hash').should('eql', '#/squadrons/squadron-1/')
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Raamon]').should('not.exist')
      })
    })

    context('Editing passes', () => {
      it('edits a pass', () => {
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          first().
          click()

        cy.get('#pass-grade').select('fair')
        cy.get('#pass-score').should('have.value', '3.0')
        cy.dataCy('savePassButton').click()
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          first().
          should('have.class', 'table-warning')
      })

      it('reassigns a pass', () => {
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=unknown]').
          dataCy('passCell').
          first().
          click()

        cy.get('#pass-pilot').type('Stretch | 55FS')
        cy.dataCy('savePassButton').click()
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          should('have.length', 3)
      })
    })

    context('Deleting passes', () => {
      it('deletes a pass', () => {
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          first().
          click()

        cy.dataCy('deletePassButton').click()
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          should('have.length', 1)
      })

      it('deletes all unassigned passes', () => {
        cy.dataCy('deleteAllUnassigned').click()

        cy.get('.modal-dialog .btn-danger').click()
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=unknown]').should('not.exist')
      })
    })
  })

  context('Editing squadron', () => {
    it('handles password form errors', () => {
      cy.dataCy('changePasswordLink').click()

      cy.get('#squadron-current_password').type('password123')
      cy.get('#squadron-new_password').type('password1234')
      cy.get('#squadron-password_confirmation').type('password123')
      cy.dataCy('changePasswordSubmit').click()
      cy.dataCy('squadron-password_confirmation-group').
        get('.invalid-feedback').
        should('contain', 'doesn’t match password')
    })

    it("changes the squadron's password", () => {
      cy.dataCy('changePasswordLink').click()

      cy.get('#squadron-current_password').type('password123')
      cy.get('#squadron-new_password').type('password1234')
      cy.get('#squadron-password_confirmation').type('password1234')
      cy.dataCy('changePasswordSubmit').click()
      cy.dataCy('changePasswordSuccess').should(
        'contain',
        'Your squadron password has been updated.'
      )

      cy.dataCy('logOutLink').click()
      cy.location('hash').should('eql', '#/')

      cy.dataCy('logInLink').click()
      cy.get('#login-field').clear()
      cy.get('#login-field').type('squadron-1')
      cy.get('#password-field').type('password1234')
      cy.dataCy('loginSubmitButton').click()
      cy.location('hash').should('eql', '#/squadrons/squadron-1/')
    })

    it('handles edit form errors', () => {
      cy.dataCy('editSquadronLink').click()

      cy.get('#squadron-name').clear()
      cy.get('#squadron-name').type(' ')
      cy.dataCy('editSquadronSubmit').click()
      cy.dataCy('squadron-name-group').get('.invalid-feedback').should('contain', 'can’t be blank')
    })

    it('edits the squadron', () => {
      cy.dataCy('editSquadronLink').click()

      cy.get('#squadron-name').type('New Name')
      cy.dataCy('editSquadronSubmit').click()
      cy.location('hash').should('eql', '#/squadrons/squadron-1/')
      cy.dataCy('squadronBoardTitle').should('contain', 'New Name Greenie Board')
    })
  })

  context('Another squadron', () => {
    beforeEach(() => {
      cy.dataCy('logOutLink').click()

      cy.dataCy('signUpButton').click()
      cy.get('#squadron-name').type('Squadron 2')
      cy.get('#squadron-email').type('cypress2@example.com')
      cy.get('#squadron-password').type('password123')
      cy.get('#squadron-password_confirmation').type('password123')
      cy.dataCy('signUpSubmit').click()
    })

    it('shows their greenie board', () => {
      cy.visit('/#/squadrons/squadron-1/')

      cy.dataCy('squadronBoardTitle').should('contain', 'Squadron 1 Greenie Board')
    })

    it('does not allow adding passes', () => {
      cy.visit('/#/squadrons/squadron-1/')

      cy.dataCy('addPassButton').should('not.exist')
      cy.dataCy('uploadButton').should('not.exist')
    })

    it('does not allow editing passes', () => {
      cy.visit('/#/squadrons/squadron-1/')

      cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Stretch\\|55FS]').
        dataCy('passCell').
        first().
        click()
      cy.dataCy('passForm').should('not.exist')
    })

    it('does not allow deleting passes', () => {
      cy.visit('/#/squadrons/squadron-1/')

      cy.dataCy('deleteAllUnassigned').should('not.exist')
    })

    it('does not allow editing pilots', () => {
      cy.visit('/#/squadrons/squadron-1/')

      cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
        dataCy('passHeaderCell').
        find('a').
        click()
      cy.dataCy('renameButton').should('not.exist')
      cy.dataCy('mergeButton').should('not.exist')
      cy.dataCy('deletePilotButton').should('not.exist')
    })
  })

  context('Deleting squadron', () => {
    it('deletes the squadron', () => {
      cy.dataCy('editSquadronLink').click()
      cy.dataCy('deleteSquadronButton').click()
      cy.get('.modal-dialog .btn-danger').click()
      cy.location('hash').should('eql', '#/')

      cy.dataCy('logInLink').click()
      cy.get('#login-field').type('squadron-1')
      cy.get('#password-field').type('password123')
      cy.dataCy('loginSubmitButton').click()
      cy.dataCy('loginError').should('contain', 'Invalid Username or password.')
    })
  })
})
