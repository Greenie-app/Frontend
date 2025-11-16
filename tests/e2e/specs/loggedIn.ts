context('Sign up', () => {
  it('handles form errors', () => {
    cy.visit('/#/')

    cy.dataCy('signUpButton').click()
    cy.get('#squadron-name input').type('Squadron 2')
    cy.get('#squadron-username input').should('have.value', 'squadron-2')
    cy.get('#squadron-email input').type('cypress2@example.com')
    cy.get('#squadron-password input').type('password123')
    cy.get('#squadron-password_confirmation input').type('notthesame')

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
      cy.wait(500)
      cy.get('body').should('contain', "doesn’t match password")
    })
  })

  it('signs up a new squadron', () => {
    cy.visit('/#/')

    cy.dataCy('signUpButton').click()
    cy.get('#squadron-name input').type('Squadron 2')
    cy.get('#squadron-username input').should('have.value', 'squadron-2')
    cy.get('#squadron-email input').type('cypress2@example.com')
    cy.get('#squadron-password input').type('password123')
    cy.get('#squadron-password_confirmation input').type('password123')

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

      cy.location('hash').should('eql', '#/squadrons/squadron-2')
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
      cy.wait(1000)
      cy.get('.n-alert, .n-form-item-feedback__line').should('contain', 'invalid content type')
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
      // Status should transition from Pending -> Processing -> Finished
      cy.dataCy('uploadStatus', { timeout: 30000 }).should('not.contain', 'Pending')

      cy.nCardClose()

      // Set date range to 2020 to show uploaded passes (log file has 2020 timestamps)
      cy.nDateRange('2020-01-01', '2020-12-31', { waitAfter: 2000, closePanel: true })

      cy.dataCy('passCell', { timeout: 20000 }).should('have.length', 12)
      // Boarding rate is calculated from the 12 passes in the 2020 date range
      // 4 traps out of 12 passes with trap values = 0.33
      cy.dataCy('squadronBoardingRate').should('contain.text', 'Boarding rate: 0.33')
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

    // Wait for page to load and set date range to 2020 (test data year)
    cy.location('hash', { timeout: 10000 }).should('match', /^#\/squadrons\/squadron-1\/?$/)

    // Set date range to cover all 2020 test data
    cy.nDateRange('2020-01-01', '2020-12-31', { waitAfter: 2000, closePanel: true })
    cy.wait(500)

    // Verify passes loaded
    cy.dataCy('passCell').should('exist')
  })

  context('Adding passes', () => {
    it('adds a pass manually', () => {
      cy.dataCy('addPassButton').click()
      cy.nInput('#pass-pilot').type('Jambo72nd')
      cy.nInput('#pass-pilot').blur()
      cy.nInput('#pass-aircraft_type').type('F-14B')
      cy.nInput('#pass-aircraft_type').blur()
      cy.get('#pass-grade').click()
      cy.get('.n-base-select-option__content').contains(/^OK$/).click()
      cy.get('#pass-score input[type="text"]').should('have.value', '4')
      cy.get('#pass-trap .n-base-selection-label').should('contain', 'This pass counts as a trap')
      cy.get('#pass-wire').should('be.visible')
      cy.nSelect('#pass-wire', '3')

      cy.dataCy('savePassButton').click()

      // The new pass has today's date, so update date range to include it
      // Extend range from 2020-01-01 to 2025-12-31
      cy.nDateRange('2020-01-01', '2025-12-31', { closePanel: true })

      cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
        dataCy('passHeaderCell').
        invoke('text').
        should('include', 'Jambo72nd (2.0)')

      cy.get('[data-cy-pilot=Jambo72nd]').
        dataCy('passCell').
        eq(1).
        dataCy('passCellScore').
        should('contain', '4.0')
      cy.get('[data-cy-pilot=Jambo72nd]').
        dataCy('passCell').
        eq(1).
        dataCy('passCellGrade').
        should('contain.text', 'OK-3')

      cy.dataCy('addPassButton').click()
      cy.nInput('#pass-pilot').should('have.value', '')
      cy.nInput('#pass-aircraft_type').should('have.value', '')
      cy.get('#pass-score input[type="text"]').should('have.value', '')
      cy.get('#pass-wire').should('not.exist')
      cy.get('#pass-trap').should('exist')

      cy.nCardClose()
      // Boarding rate now includes all passes in the 2020-2025 range
      // Original test data (4 traps / 12 attempts) + new pass (1 trap / 1 attempt) = 5/13 ≈ 0.38
      cy.dataCy('squadronBoardingRate').should('contain.text', 'Boarding rate: 0.38')
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
        cy.wait(500)
        cy.get('body').should('contain', "can’t be blank")
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
        cy.nDropdownOption('Jambo72nd')
        cy.dataCy('mergeConfirmButton').click()
        cy.location('hash').should('eql', '#/squadrons/squadron-1')

        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
          dataCy('passHeaderCell').
          invoke('text').
          should('include', 'Jambo72nd')
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Jambo72nd]').
          dataCy('passHeaderCell').
          invoke('text').
          should('include', '(0.7)')
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
        cy.nDialogConfirm('error')

        cy.location('hash').should('eql', '#/squadrons/squadron-1')
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=Raamon]').should('not.exist')
      })
    })

    context('Editing passes', () => {
      it('edits a pass', () => {
        cy.get('[data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          first().
          click()

        cy.nSelect('#pass-grade', 'Fair')
        cy.wait(200) // Wait for score calculation after grade change
        cy.get('#pass-score input[type="text"]').should('have.value', '3')
        cy.dataCy('savePassButton').click()
        cy.wait(500) // Wait for save and UI update
        cy.get('[data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          first().
          should('have.css', 'background-color', 'rgb(255, 193, 7)')
      })

      it('reassigns a pass', () => {
        cy.get('[data-cy-pilot=unknown]').
          dataCy('passCell').
          first().
          click()

        cy.get('#pass-pilot').type('Stretch | 55FS')
        cy.dataCy('savePassButton').click()
        cy.get('[data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          should('have.length', 3)
      })
    })

    context('Deleting passes', () => {
      it('deletes a pass', () => {
        cy.get('[data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          first().
          click()

        cy.dataCy('deletePassButton').click()
        cy.get('[data-cy-pilot=Stretch\\|55FS]').
          dataCy('passCell').
          should('have.length', 1)
      })

      it('deletes all unassigned passes', () => {
        cy.dataCy('deleteAllUnassigned').click()

        cy.nDialogConfirm('warning', 'Delete All')
        cy.get('[data-cy=squadronBoardRow][data-cy-pilot=unknown]').should('not.exist')
      })
    })
  })

  context('Editing squadron', () => {
    it('handles password form errors', () => {
      // Wait for squadron board to load before clicking any links
      cy.dataCy('squadronBoardTitle', { timeout: 10000 }).should('be.visible')

      cy.dataCy('changePasswordLink').click()
      cy.location('hash').should('include', '/password/change')

      cy.get('#squadron-current_password', { timeout: 10000 }).should('be.visible')
      cy.nInput('#squadron-current_password').type('password123')
      cy.nInput('#squadron-new_password').type('password1234')
      cy.nInput('#squadron-password_confirmation').type('password123')
      cy.dataCy('changePasswordSubmit').click()
      cy.wait(500)
      cy.get('.n-form-item-feedback__line').should('contain', "doesn’t match password")
    })

    it("changes the squadron's password", () => {
      // Wait for squadron board to load before clicking any links
      cy.dataCy('squadronBoardTitle', { timeout: 10000 }).should('be.visible')

      cy.dataCy('changePasswordLink').click()
      cy.location('hash').should('include', '/password/change')

      cy.get('#squadron-current_password', { timeout: 10000 }).should('be.visible')
      cy.nInput('#squadron-current_password').type('password123')
      cy.nInput('#squadron-new_password').type('password1234')
      cy.nInput('#squadron-password_confirmation').type('password1234')
      cy.dataCy('changePasswordSubmit').click()
      cy.dataCy('changePasswordSuccess').should(
        'contain',
        'Your squadron password has been updated.'
      )

      cy.dataCy('logOutLink').click()
      cy.location('hash').should('eql', '#/')

      cy.dataCy('logInLink').click()
      cy.get('#login-field input').clear()
      cy.get('#login-field input').type('squadron-1')
      cy.get('#password-field input').type('password1234')
      cy.dataCy('loginSubmitButton').click()
      cy.location('hash').should('eql', '#/squadrons/squadron-1')
    })

    it('handles edit form errors', () => {
      // Wait for squadron board to load before clicking any links
      cy.dataCy('squadronBoardTitle', { timeout: 10000 }).should('be.visible')

      cy.dataCy('editSquadronLink').click()
      cy.location('hash').should('include', '/squadron/edit')

      cy.get('#squadron-name', { timeout: 10000 }).should('be.visible')
      cy.get('#squadron-name input').clear()
      cy.get('#squadron-name input').type(' ')
      cy.dataCy('editSquadronSubmit').click()
      cy.wait(500)
      cy.get('.n-form-item-feedback__line').should('contain', "can’t be blank")
    })

    it('edits the squadron', () => {
      // Wait for squadron board to load before clicking any links
      cy.dataCy('squadronBoardTitle', { timeout: 10000 }).should('be.visible')

      cy.dataCy('editSquadronLink').click()
      cy.location('hash').should('include', '/squadron/edit')

      cy.get('#squadron-name', { timeout: 10000 }).should('be.visible')
      cy.get('#squadron-name input').type('New Name')
      cy.dataCy('editSquadronSubmit').click()
      cy.location('hash').should('eql', '#/squadrons/squadron-1')
      cy.dataCy('squadronBoardTitle').should('contain', 'New Name Greenie Board')
    })
  })

  context('Another squadron', () => {
    beforeEach(() => {
      cy.dataCy('logOutLink').click()

      cy.dataCy('signUpButton').click()
      cy.get('#squadron-name input').type('Squadron 2')
      cy.get('#squadron-email input').type('cypress2@example.com')
      cy.get('#squadron-password input').type('password123')
      cy.get('#squadron-password_confirmation input').type('password123')
      cy.dataCy('signUpSubmit').click()
    })

    it('shows their greenie board', () => {
      cy.visit('/#/squadrons/squadron-1')

      cy.dataCy('squadronBoardTitle').should('contain', 'Squadron 1 Greenie Board')
    })

    it('does not allow adding passes', () => {
      cy.visit('/#/squadrons/squadron-1')

      cy.dataCy('addPassButton').should('not.exist')
      cy.dataCy('uploadButton').should('not.exist')
    })

    it('does not allow editing passes', () => {
      cy.visit('/#/squadrons/squadron-1')

      cy.get('[data-cy-pilot=Stretch\\|55FS]').
        dataCy('passCell').
        first().
        click()
      cy.dataCy('passForm').should('not.exist')
    })

    it('does not allow deleting passes', () => {
      cy.visit('/#/squadrons/squadron-1')

      cy.dataCy('deleteAllUnassigned').should('not.exist')
    })

    it('does not allow editing pilots', () => {
      cy.visit('/#/squadrons/squadron-1')

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
      // Wait for squadron board to load before clicking any links
      cy.dataCy('squadronBoardTitle', { timeout: 10000 }).should('be.visible')

      cy.dataCy('editSquadronLink').click()
      cy.dataCy('deleteSquadronButton', { timeout: 10000 }).should('be.visible')
      cy.dataCy('deleteSquadronButton').click()
      // Click the Delete button in the confirmation modal
      cy.nDialogConfirm('error', 'Delete')
      cy.location('hash').should('eql', '#/')

      cy.dataCy('logInLink').click()
      cy.get('#login-field').type('squadron-1')
      cy.get('#password-field').type('password123')
      cy.dataCy('loginSubmitButton').click()
      cy.dataCy('loginError').should('contain', 'Invalid Username or password.')
    })
  })
})
