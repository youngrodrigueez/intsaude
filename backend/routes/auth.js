const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../database')

const router = express.Router()

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

module.exports = router
