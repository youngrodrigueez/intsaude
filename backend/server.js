require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/hospitals', require('./routes/hospitals'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/appointments', require('./routes/appointments'))

app.listen(PORT, () => {
  console.log(`IntSaude API rodando em http://localhost:${PORT}`)
})
