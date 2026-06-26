describe('Autenticação', () => {
  beforeEach(() => {
    cy.logout()
  })

  it('exibe a tela de login', () => {
    cy.visit('/login')
    cy.contains('intSaúde').should('be.visible')
    cy.contains('Bem-vindo de volta').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').contains('Entrar').should('be.visible')
  })

  it('faz login com credenciais válidas', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('admin@intsaude.com')
    cy.get('input[type="password"]').first().type('admin123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Olá').should('be.visible')
  })

  it('exibe erro com credenciais inválidas', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('usuario@errado.com')
    cy.get('input[type="password"]').first().type('senhaerrada')
    cy.get('button[type="submit"]').click()
    cy.contains('inválidos').should('be.visible')
    cy.url().should('include', '/login')
  })

  it('alterna para a aba de cadastro', () => {
    cy.visit('/login')
    cy.contains('button', 'Cadastrar').click()
    cy.contains('Criar conta').should('be.visible')
    cy.get('input[placeholder="Seu nome"]').should('be.visible')
  })

  it('exibe erro ao cadastrar com senhas diferentes', () => {
    cy.visit('/login')
    cy.contains('button', 'Cadastrar').click()
    cy.get('input[placeholder="Seu nome"]').type('Teste Usuário')
    cy.get('input[type="email"]').type('teste@intsaude.com')
    cy.get('input[type="password"]').eq(0).type('senha123')
    cy.get('input[type="password"]').eq(1).type('senha456')
    cy.get('button[type="submit"]').click()
    cy.contains('não coincidem').should('be.visible')
  })

  it('redireciona para login ao acessar rota protegida sem autenticação', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })
})
