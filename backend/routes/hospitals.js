const express = require('express')
const db = require('../database')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/', auth, (req, res) => {
  const hospitals = db.prepare('SELECT * FROM hospitals ORDER BY name').all()
  res.json(hospitals)
})

module.exports = router
