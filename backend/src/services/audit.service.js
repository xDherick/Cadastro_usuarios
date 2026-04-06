// src/services/audit.service.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Registra uma ação de auditoria.
 * Falha silenciosa — nunca deve quebrar o fluxo principal.
 */
const log = async ({ actorId, actorName, actorEmail, action, target = {}, details = null }) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        actorName,
        actorEmail,
        action,
        targetUserId:  target.id    || null,
        targetName:    target.name  || null,
        targetEmail:   target.email || null,
        details,
      },
    });
  } catch (err) {
    // Log no console mas não propaga o erro
    console.error('[AuditLog] Falha ao registrar:', err.message);
  }
};

/**
 * Busca logs paginados com filtro opcional por ação.
 */
const getLogs = async ({ page = 1, limit = 20, action = '' }) => {
  const skip = (page - 1) * limit;
  const where = action ? { action } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

module.exports = { log, getLogs };
