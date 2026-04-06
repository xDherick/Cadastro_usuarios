const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars');

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json({ user });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const data = {};

    // Atualiza nome
    if (name && name.trim().length >= 2) {
      data.name = name.trim();
    }

    // Atualiza e-mail (verifica duplicata)
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ message: 'E-mail já está em uso.' });
      data.email = email;
    }

    // Atualiza senha (exige senha atual)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Informe a senha atual para definir uma nova.' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Senha atual incorreta.' });
      }
      if (newPassword.length < 8) {
        return res.status(422).json({ message: 'Nova senha deve ter ao menos 8 caracteres.' });
      }
      data.password = await bcrypt.hash(newPassword, 12);
    }

    // Processa avatar (se enviado)
    if (req.file) {
      // Remove avatar antigo do disco
      if (user.avatar) {
        const oldPath = path.join(AVATARS_DIR, user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Gera nome único e redimensiona para 200x200 com sharp
      const filename = `${crypto.randomBytes(16).toString('hex')}.webp`;
      const outputPath = path.join(AVATARS_DIR, filename);

      await sharp(req.file.buffer)
        .resize(200, 200, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toFile(outputPath);

      data.avatar = filename;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nenhum dado para atualizar.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });

    return res.json({ message: 'Perfil atualizado com sucesso!', user: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/profile/avatar
const removeAvatar = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.avatar) return res.status(400).json({ message: 'Nenhum avatar para remover.' });

    const filePath = path.join(AVATARS_DIR, user.avatar);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: null },
    });

    return res.json({ message: 'Avatar removido.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, removeAvatar };
