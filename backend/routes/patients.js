const express = require('express')
const db = require('../database')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM patients ORDER BY name').all())
})

router.post('/', auth, (req, res) => {
  const { name, cpf, email, phone, birth_date, address } = req.body
  try {
    const result = db.prepare(
      'INSERT INTO patients (name, cpf, email, phone, birth_date, address) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, cpf, email, phone, birth_date, address)
    res.status(201).json(db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid))
  } catch {
    res.status(400).json({ message: 'CPF já cadastrado' })
  }
})

router.put('/:id', auth, (req, res) => {
  const { name, cpf, email, phone, birth_date, address } = req.body
  db.prepare(
    'UPDATE patients SET name=?, cpf=?, email=?, phone=?, birth_date=?, address=? WHERE id=?'
  ).run(name, cpf, email, phone, birth_date, address, req.params.id)
  res.json(db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id))
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id)
  res.json({ message: 'Paciente removido' })
})

module.exports = router
