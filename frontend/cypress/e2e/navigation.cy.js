describe('Navegação', () => {
  beforeEach(() => {
    cy.login()
  })

  it('exibe o dashboard após login', () => {
    cy.url().should('include', '/dashboard')
    cy.contains('Olá').should('be.visible')
    cy.contains('Total de Pacientes').should('be.visible')
    cy.contains('Agendamentos Hoje').should('be.visible')
    cy.contains('Hospitais Disponíveis').should('be.visible')
  })

  it('navega para a página de hospitais', () => {
    cy.contains('Hospitais').click()
    cy.url().should('include', '/hospitals')
    cy.contains('Hospitais').should('be.visible')
    cy.contains('Ver Mapa').should('be.visible')
  })

  it('navega para a página de pacientes', () => {
    cy.contains('Pacientes').click()
    cy.url().should('include', '/patients')
    cy.contains('Novo Paciente').should('be.visible')
  })

  it('navega para a página de agendamentos', () => {
    cy.contains('Agendamentos').click()
    cy.url().should('include', '/appointments')
    cy.contains('Novo Agendamento').should('be.visible')
    cy.contains('Exportar PDF').should('be.visible')
  })

  it('exibe o mapa de hospitais ao clicar em Ver Mapa', () => {
    cy.visit('/hospitals')
    cy.contains('Ver Mapa').click()
    cy.get('#hospital-map').should('be.visible')
  })

  it('faz logout e redireciona para login', () => {
    cy.get('[data-cy="logout"], button').contains('logout').click({ force: true })
    cy.url().should('include', '/login')
  })
})
