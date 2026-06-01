const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'intsaude_jwt_secret_2024')
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}
