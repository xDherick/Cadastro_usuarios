const { Router } = require('express');
const { listLogs } = require('../controllers/audit.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

const router = Router();

// Apenas admins podem ver os logs
router.get('/', authenticate, requireAdmin, listLogs);

module.exports = router;
