// src/routes/profile.routes.js
const { Router } = require('express');
const { getProfile, updateProfile, removeAvatar } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/profile
router.get('/', getProfile);

// PATCH /api/profile — campo "avatar" é o nome do input file
router.patch('/', upload.single('avatar'), updateProfile);

// DELETE /api/profile/avatar
router.delete('/avatar', removeAvatar);

module.exports = router;
