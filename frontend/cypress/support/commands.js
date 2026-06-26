Cypress.Commands.add('login', (email = 'admin@intsaude.com', password = 'admin123') => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').first().type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('logout', () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
})
