// src/services/token.service.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Gera access token JWT (curto prazo)
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Gera refresh token opaco (string aleatória) e persiste no banco
const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

// Valida refresh token: existe, não foi revogado, não expirou
const validateRefreshToken = async (token) => {
  const record = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) throw new Error('Refresh token não encontrado.');
  if (record.revokedAt) throw new Error('Refresh token revogado.');
  if (record.expiresAt < new Date()) throw new Error('Refresh token expirado.');
  if (!record.user.active) throw new Error('Usuário inativo.');

  return record;
};

// Revoga um refresh token específico (logout)
const revokeRefreshToken = async (token) => {
  await prisma.refreshToken.updateMany({
    where: { token, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

// Revoga todos os refresh tokens do usuário (logout de todos os dispositivos)
const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

// Limpa tokens expirados e revogados (pode ser chamado periodicamente)
const purgeExpiredTokens = async () => {
  const { count } = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  });
  return count;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  purgeExpiredTokens,
};
