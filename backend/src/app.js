// src/app.js
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Handler de erros (deve ser o último middleware)
app.use(errorHandler);

module.exports = app;
