const express = require('express')
const db = require('../database')
const auth = require('../middleware/auth')

const router = express.Router()

const withNames = `
  SELECT a.*, p.name as patient_name, h.name as hospital_name
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN hospitals h ON a.hospital_id = h.id
`

router.get('/', auth, (req, res) => {
  res.json(db.prepare(`${withNames} ORDER BY a.date DESC, a.time DESC`).all())
})

router.post('/', auth, (req, res) => {
  const { patient_id, hospital_id, date, time, status, notes } = req.body
  const result = db.prepare(
    'INSERT INTO appointments (patient_id, hospital_id, date, time, status, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(patient_id, hospital_id, date, time, status || 'scheduled', notes || '')
  res.status(201).json(db.prepare(`${withNames} WHERE a.id = ?`).get(result.lastInsertRowid))
})

router.put('/:id', auth, (req, res) => {
  const { patient_id, hospital_id, date, time, status, notes } = req.body
  db.prepare(
    'UPDATE appointments SET patient_id=?, hospital_id=?, date=?, time=?, status=?, notes=? WHERE id=?'
  ).run(patient_id, hospital_id, date, time, status, notes, req.params.id)
  res.json(db.prepare(`${withNames} WHERE a.id = ?`).get(req.params.id))
})

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id)
  res.json({ message: 'Agendamento removido' })
})

module.exports = router
