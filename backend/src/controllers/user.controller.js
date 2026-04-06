// src/controllers/user.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const audit = require('../services/audit.service');

const prisma = new PrismaClient();

// GET /api/users
const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search ? {
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: Number(limit),
        select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) { next(error); }
};

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json({ user });
  } catch (error) { next(error); }
};

// PATCH /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, active } = req.body;

    if (req.userRole !== 'ADMIN' && req.userId !== req.params.id) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    // Busca estado anterior para detectar mudanças relevantes
    const before = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!before) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const data = {};
    if (name)     data.name  = name;
    if (email)    data.email = email;
    if (password) data.password = await bcrypt.hash(password, 12);
    if (req.userRole === 'ADMIN') {
      if (role   !== undefined) data.role   = role;
      if (active !== undefined) data.active = active;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    // Determina a ação de auditoria mais relevante
    let action = 'USER_UPDATED';
    if (active !== undefined && active !== before.active) {
      action = active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    }

    // Busca dados do ator para o log
    const actor = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true },
    });

    await audit.log({
      actorId:    actor.id,
      actorName:  actor.name,
      actorEmail: actor.email,
      action,
      target: { id: user.id, name: user.name, email: user.email },
      details: { changedFields: Object.keys(data).filter((k) => k !== 'password') },
    });

    return res.json({ message: 'Usuário atualizado.', user });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'E-mail já está em uso.' });
    next(error);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Você não pode deletar sua própria conta.' });
    }

    const target = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true },
    });
    if (!target) return res.status(404).json({ message: 'Usuário não encontrado.' });

    await prisma.user.delete({ where: { id: req.params.id } });

    const actor = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true },
    });

    await audit.log({
      actorId:    actor.id,
      actorName:  actor.name,
      actorEmail: actor.email,
      action:     'USER_DELETED',
      target,
    });

    return res.json({ message: 'Usuário removido.' });
  } catch (error) { next(error); }
};

module.exports = { listUsers, getUser, updateUser, deleteUser };
