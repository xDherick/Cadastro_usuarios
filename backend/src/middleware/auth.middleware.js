// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

// Verifica se o token JWT é válido
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

// Verifica se o usuário é ADMIN
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
