const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../database')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/register', (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ message: 'E-mail já cadastrado' })
  }

  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hash, 'user')

  const token = jwt.sign(
    { id: result.lastInsertRowid, name, email, role: 'user' },
    process.env.JWT_SECRET || 'intsaude_jwt_secret_2024',
    { expiresIn: '8h' }
  )

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, name, email, role: 'user' }
  })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' })

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Credenciais inválidas' })
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'intsaude_jwt_secret_2024',
    { expiresIn: '8h' }
  )

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
})

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })
  res.json(user)
})

router.put('/me', auth, (req, res) => {
  const { name, currentPassword, newPassword } = req.body
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  if (newPassword) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ message: 'Senha atual incorreta' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' })
    }
    const hash = bcrypt.hashSync(newPassword, 10)
    db.prepare('UPDATE users SET name = ?, password = ? WHERE id = ?').run(name || user.name, hash, user.id)
  } else {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name || user.name, user.id)
  }

  const updated = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(user.id)

  const token = jwt.sign(
    { id: updated.id, name: updated.name, email: updated.email, role: updated.role },
    process.env.JWT_SECRET || 'intsaude_jwt_secret_2024',
    { expiresIn: '8h' }
  )

  res.json({ token, user: updated })
})

module.exports = router
