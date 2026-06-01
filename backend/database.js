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

module.exports = db
