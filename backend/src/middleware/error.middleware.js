// src/middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Erros conhecidos do Prisma
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Registro não encontrado.' });
  }

  // Erros de validação JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido.' });
  }

  return res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor.',
  });
};

module.exports = { errorHandler };
