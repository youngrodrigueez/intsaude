describe('Pacientes', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/patients')
  })

  it('exibe a lista de pacientes', () => {
    cy.contains('Pacientes').should('be.visible')
    cy.contains('Novo Paciente').should('be.visible')
    cy.get('.q-table').should('exist')
  })

  it('abre o formulário de novo paciente', () => {
    cy.contains('button', 'Novo Paciente').click()
    cy.get('.q-dialog').should('be.visible')
    cy.get('.dialog-title').contains('Novo Paciente').should('be.visible')
    cy.get('input').should('have.length.greaterThan', 0)
  })

  it('cadastra um novo paciente', () => {
    cy.contains('button', 'Novo Paciente').click()
    cy.get('.q-dialog').should('be.visible')
    cy.get('input[aria-label="Nome completo *"], .q-input input').eq(0).type('Paciente Cypress')
    cy.get('input[aria-label="CPF *"], .q-input input').eq(1).type('99988877766')
    cy.get('input[aria-label="Telefone"], .q-input input').eq(2).type('61999999999')
    cy.get('input[aria-label="E-mail"], .q-input input').eq(3).type('cypress@teste.com')
    cy.contains('button', 'Salvar').click()
    cy.contains('cadastrado').should('be.visible')
    cy.contains('Paciente Cypress').should('be.visible')
  })

  it('filtra pacientes pelo nome', () => {
    cy.get('input[placeholder="Buscar paciente..."]').type('João')
    cy.get('.q-table tbody tr').each($row => {
      cy.wrap($row).contains('João')
    })
  })

  it('abre o formulário de edição ao clicar em editar', () => {
    cy.get('.edit-btn').first().click()
    cy.get('.q-dialog').should('be.visible')
    cy.contains('Editar Paciente').should('be.visible')
  })
})
