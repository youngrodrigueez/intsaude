const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

const db = new Database(path.join(__dirname, 'intsaude.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT,
    specialty TEXT,
    available INTEGER DEFAULT 1,
    rating REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date TEXT,
    address TEXT,
    has_allergy INTEGER DEFAULT 0,
    has_chronic_disease INTEGER DEFAULT 0,
    takes_medication INTEGER DEFAULT 0,
    had_surgery INTEGER DEFAULT 0,
    is_smoker INTEGER DEFAULT 0,
    has_health_plan INTEGER DEFAULT 0,
    photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    hospital_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
  );
`)

const patientColumns = ['has_allergy', 'has_chronic_disease', 'takes_medication', 'had_surgery', 'is_smoker', 'has_health_plan']
const existingColumns = new Set(db.prepare("PRAGMA table_info(patients)").all().map(c => c.name))
patientColumns.forEach(col => {
  if (!existingColumns.has(col)) {
    db.exec(`ALTER TABLE patients ADD COLUMN ${col} INTEGER DEFAULT 0`)
  }
})
if (!existingColumns.has('photo')) {
  db.exec('ALTER TABLE patients ADD COLUMN photo TEXT')
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
if (userCount.count === 0) {
  const hash = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Admin IntSaude', 'admin@intsaude.com', hash, 'admin'
  )

  const hospitals = [
    ['Hospital de Base do Distrito Federal', 'SMHS Área Especial, Asa Sul', 'Brasília', '(61) 3315-1600', 'Geral', 1, 4.2],
    ['Hospital Regional da Asa Norte (HRAN)', 'SMHN Quadra 101, Asa Norte', 'Brasília', '(61) 3327-0100', 'Geral', 1, 4.0],
    ['Hospital Santa Lúcia', 'SHLS Quadra 716, Asa Sul', 'Brasília', '(61) 3445-0000', 'Cardiologia', 1, 4.7],
    ['Hospital Brasília', 'SGAS Quadra 614, Asa Sul', 'Brasília', '(61) 3340-7000', 'Oncologia', 1, 4.5],
    ['Hospital Daher Lago Sul', 'SHIS QL 10, Lago Sul', 'Brasília', '(61) 3248-9500', 'Ortopedia', 0, 4.3],
  ]
  const insertHospital = db.prepare(
    'INSERT INTO hospitals (name, address, city, phone, specialty, available, rating) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  hospitals.forEach(h => insertHospital.run(...h))

  const patients = [
    ['João Silva', '123.456.789-00', 'joao.silva@email.com', '(51) 98765-4321', '1985-03-15', 'Av. Farroupilha, 1000'],
    ['Maria Santos', '987.654.321-00', 'maria.santos@email.com', '(51) 91234-5678', '1990-07-22', 'Rua das Flores, 250'],
    ['Carlos Oliveira', '111.222.333-44', 'carlos@email.com', '(51) 99999-1111', '1978-11-30', 'Travessa do Carmo, 45'],
  ]
  const insertPatient = db.prepare(
    'INSERT INTO patients (name, cpf, email, phone, birth_date, address) VALUES (?, ?, ?, ?, ?, ?)'
  )
  patients.forEach(p => insertPatient.run(...p))

  const insertAppt = db.prepare(
    'INSERT INTO appointments (patient_id, hospital_id, date, time, status, notes) VALUES (?, ?, ?, ?, ?, ?)'
  )
  insertAppt.run(1, 1, '2026-06-10', '09:00', 'scheduled', 'Consulta de rotina')
  insertAppt.run(2, 2, '2026-06-12', '14:30', 'scheduled', 'Avaliação cardiológica')
  insertAppt.run(3, 3, '2026-06-05', '11:00', 'completed', 'Retorno pós-cirurgia')
}

// Hospitais adicionais de outras regiões do DF
const moreHospitals = [
  ['Hospital Regional de Taguatinga (HRT)', 'QNC Área Especial, Taguatinga Centro', 'Taguatinga', '(61) 3352-1000', 'Geral', 1, 4.1],
  ['Hospital Regional de Ceilândia (HRC)', 'QNM 13, Área Especial, Ceilândia', 'Ceilândia', '(61) 3373-5000', 'Geral', 1, 3.9],
  ['Hospital Regional do Gama (HRG)', 'Av. Castro Alves, Setor Leste, Gama', 'Gama', '(61) 3389-2400', 'Geral', 1, 4.0],
  ['Hospital Regional de Samambaia (HRSAM)', 'QS 109, Área Especial, Samambaia', 'Samambaia', '(61) 3358-4000', 'Geral', 1, 3.8],
  ['Hospital Regional de Sobradinho (HRS)', 'Quadra 09, Área Especial, Sobradinho', 'Sobradinho', '(61) 3387-1500', 'Geral', 1, 4.0],
  ['Hospital Regional de Planaltina (HRP)', 'Área Especial nº 1, Setor Tradicional, Planaltina', 'Planaltina', '(61) 3389-7600', 'Geral', 1, 3.9],
  ['Hospital Regional do Paranoá (HRPa)', 'Quadra 02, Área Especial, Paranoá', 'Paranoá', '(61) 3445-2900', 'Geral', 0, 3.7],
  ['Hospital Regional do Guará (HRGu)', 'QE 09, Área Especial, Guará II', 'Guará', '(61) 3901-5800', 'Pediatria', 1, 4.2],
  ['Hospital São Vicente de Paulo', 'Praça do Relógio, Taguatinga Centro', 'Taguatinga', '(61) 3561-9000', 'Cardiologia', 1, 4.4],
  ['Hospital Universitário de Brasília (HUB)', 'SGAN 605, Asa Norte', 'Brasília', '(61) 3448-5000', 'Geral', 1, 4.3],
]

const existingNames = new Set(db.prepare('SELECT name FROM hospitals').all().map(h => h.name))
const insertMoreHospital = db.prepare(
  'INSERT INTO hospitals (name, address, city, phone, specialty, available, rating) VALUES (?, ?, ?, ?, ?, ?, ?)'
)
moreHospitals.forEach(h => {
  if (!existingNames.has(h[0])) insertMoreHospital.run(...h)
})

module.exports = db
