// src/controllers/audit.controller.js
const { getLogs } = require('../services/audit.service');

// GET /api/audit
const listLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action = '' } = req.query;
    const result = await getLogs({ page, limit, action });
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { listLogs };
