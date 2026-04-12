// src/controllers/password.controller.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { sendPasswordResetEmail } = require('../services/mail.service');

const prisma = new PrismaClient();
const RESET_EXPIRES_MINUTES = 15;

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const genericResponse = {
      message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
    };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) return res.json(genericResponse);

    // Invalida tokens anteriores
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_EXPIRES_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
    } catch (mailError) {
      // Log detalhado do erro de e-mail para debug
      console.error('[MAIL ERROR]', mailError.message);
      console.error('[MAIL ERROR DETAIL]', JSON.stringify({
        code: mailError.code,
        command: mailError.command,
        response: mailError.response,
      }));
      // Retorna erro claro ao invés de 500 genérico
      return res.status(503).json({
        message: 'Erro ao enviar e-mail. Verifique as configurações do Gmail.',
        detail: mailError.message,
      });
    }

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) return res.status(400).json({ message: 'Token não fornecido.' });
    if (!newPassword || newPassword.length < 8) {
      return res.status(422).json({ message: 'A nova senha deve ter ao menos 8 caracteres.' });
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record)        return res.status(400).json({ message: 'Token inválido.' });
    if (record.usedAt)  return res.status(400).json({ message: 'Este link já foi utilizado.' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'Este link expirou. Solicite um novo.' });
    if (!record.user.active) return res.status(400).json({ message: 'Usuário inativo.' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    return res.json({ message: 'Senha redefinida com sucesso! Faça login com a nova senha.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/validate-reset-token
const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.query;
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return res.status(400).json({ valid: false, message: 'Token inválido ou expirado.' });
    }
    return res.json({ valid: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { forgotPassword, resetPassword, validateResetToken };
