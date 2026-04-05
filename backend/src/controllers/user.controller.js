// src/controllers/user.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// GET /api/users — lista todos (admin only)
const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
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
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, active } = req.body;

    // Usuário comum só pode editar o próprio perfil
    if (req.userRole !== 'ADMIN' && req.userId !== req.params.id) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 12);
    // Apenas admin pode alterar role e active
    if (req.userRole === 'ADMIN') {
      if (role !== undefined) data.role = role;
      if (active !== undefined) data.active = active;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    return res.json({ message: 'Usuário atualizado.', user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'E-mail já está em uso.' });
    }
    next(error);
  }
};

// DELETE /api/users/:id (admin only)
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Você não pode deletar sua própria conta.' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Usuário removido.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listUsers, getUser, updateUser, deleteUser };
