// src/routes/auth.routes.js
const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout, logoutAll, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

const registerRules = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório.').isLength({ min: 2 }).withMessage('Nome muito curto.'),
  body('email').isEmail().withMessage('E-mail inválido.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Senha deve ter ao menos 8 caracteres.'),
];

const loginRules = [
  body('email').isEmail().withMessage('E-mail inválido.').normalizeEmail(),
  body('password').notEmpty().withMessage('Senha é obrigatória.'),
];

// Públicas
router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);

// Protegidas
router.get('/me',             authenticate, me);
router.post('/logout-all',    authenticate, logoutAll);

module.exports = router;
