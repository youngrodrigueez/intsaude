describe('Agendamentos', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/appointments')
  })

  it('exibe a lista de agendamentos', () => {
    cy.contains('Agendamentos').should('be.visible')
    cy.contains('Novo Agendamento').should('be.visible')
    cy.contains('Exportar PDF').should('be.visible')
    cy.get('.q-table').should('exist')
  })

  it('abre o formulário de novo agendamento', () => {
    cy.contains('button', 'Novo Agendamento').click()
    cy.get('.q-dialog').should('be.visible')
    cy.get('.dialog-title').contains('Novo Agendamento').should('be.visible')
  })

  it('exibe badge de status nos agendamentos', () => {
    cy.get('.status-badge').should('exist')
  })

  it('filtra agendamentos pelo nome do paciente', () => {
    cy.get('input[placeholder="Buscar agendamento..."]').type('João')
    cy.get('.q-table tbody tr').each($row => {
      cy.wrap($row).invoke('text').should('match', /joão/i)
    })
  })

  it('gera o PDF ao clicar em Exportar PDF', () => {
    cy.contains('Exportar PDF').click()
  })

  it('abre o formulário de edição ao clicar em editar', () => {
    cy.get('.edit-btn').first().click()
    cy.get('.q-dialog').should('be.visible')
    cy.contains('Editar Agendamento').should('be.visible')
  })

  it('exibe diálogo de confirmação ao excluir', () => {
    cy.get('.del-btn').first().click()
    cy.get('.q-dialog').should('be.visible')
    cy.contains('Confirmar exclusão').should('be.visible')
    cy.contains('Cancelar').click()
  })
})
