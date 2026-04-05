// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require('../services/token.service');

const prisma = new PrismaClient();
const audit = require('../services/audit.service');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const accessToken  = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    await audit.log({
      actorId:    user.id,
      actorName:  user.name,
      actorEmail: user.email,
      action:     'USER_CREATED',
      target:     { id: user.id, name: user.name, email: user.email },
    });

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const accessToken  = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    return res.json({
      message: 'Login realizado com sucesso!',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token não fornecido.' });
    }

    const record = await validateRefreshToken(refreshToken);

    // Rotaciona o token: revoga o atual e gera um novo par
    await revokeRefreshToken(refreshToken);

    const newAccessToken  = generateAccessToken(record.user.id, record.user.role);
    const newRefreshToken = await generateRefreshToken(record.user.id);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    // Erros de validação do token são 401
    if (['Refresh token não encontrado.', 'Refresh token revogado.', 'Refresh token expirado.', 'Usuário inativo.'].includes(error.message)) {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    return res.json({ message: 'Logout realizado com sucesso.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout-all  — encerra todas as sessões do usuário
const logoutAll = async (req, res, next) => {
  try {
    await revokeAllUserTokens(req.userId);
    return res.json({ message: 'Todas as sessões encerradas.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, logoutAll, me };
