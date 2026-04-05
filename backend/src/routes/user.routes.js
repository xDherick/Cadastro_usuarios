// src/routes/user.routes.js
const { Router } = require('express');
const { body } = require('express-validator');
const { listUsers, getUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/users — listagem paginada (admin only)
router.get('/', requireAdmin, listUsers);

// GET /api/users/:id
router.get('/:id', getUser);

// PATCH /api/users/:id
router.patch(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome muito curto.'),
    body('email').optional().isEmail().withMessage('E-mail inválido.').normalizeEmail(),
    body('password').optional().isLength({ min: 8 }).withMessage('Senha deve ter ao menos 8 caracteres.'),
    body('role').optional().isIn(['ADMIN', 'USER']).withMessage('Role inválida.'),
  ],
  validate,
  updateUser
);

// DELETE /api/users/:id (admin only)
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
