// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/auth.routes');
const userRoutes    = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const auditRoutes   = require('./routes/audit.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// CORS — aceita a origem configurada no .env ou qualquer origem em dev
const allowedOrigin = process.env.CLIENT_URL;

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman, curl) e a origin configurada
    if (!origin || !allowedOrigin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origem: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve avatares como arquivos estáticos
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/audit',   auditRoutes);

// Handler de erros
app.use(errorHandler);

module.exports = app;
